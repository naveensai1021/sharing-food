package org.sharingfood.service;

import org.sharingfood.dto.*;
import org.sharingfood.entity.*;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final DonationRepository donationRepository;
    private final ReportRepository reportRepository;
    private final AddressRepository addressRepository;
    private final VolunteerService volunteerService;
    private final AuditService auditService;

    public AdminService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            VolunteerProfileRepository volunteerProfileRepository,
            DonationRepository donationRepository,
            ReportRepository reportRepository,
            AddressRepository addressRepository,
            VolunteerService volunteerService,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.donationRepository = donationRepository;
        this.reportRepository = reportRepository;
        this.addressRepository = addressRepository;
        this.volunteerService = volunteerService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard() {
        AdminDashboardDto dto = new AdminDashboardDto();

        List<User> allUsers = userRepository.findAll();
        dto.setTotalUsers(allUsers.size());

        long suppliers = 0, beneficiaries = 0, volunteers = 0;
        for (User u : allUsers) {
            for (Role r : u.getRoles()) {
                if ("ROLE_SUPPLIER".equals(r.getName())) suppliers++;
                else if ("ROLE_BENEFICIARY".equals(r.getName())) beneficiaries++;
                else if ("ROLE_VOLUNTEER".equals(r.getName())) volunteers++;
            }
        }
        dto.setTotalSuppliers(suppliers);
        dto.setTotalBeneficiaries(beneficiaries);
        dto.setTotalVolunteers(volunteers);

        List<VolunteerProfile> pendingVolunteers = volunteerProfileRepository.findByVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        dto.setPendingVolunteerVerifications(pendingVolunteers.size());

        dto.setTotalDonations(donationRepository.count());
        dto.setAvailableDonations(donationRepository.countByStatus(DonationStatus.AVAILABLE));
        dto.setReservedDonations(donationRepository.countByStatus(DonationStatus.RESERVED));
        dto.setCompletedDonations(donationRepository.countByStatus(DonationStatus.COMPLETED));
        dto.setCancelledDonations(donationRepository.countByStatus(DonationStatus.CANCELLED));
        dto.setExpiredDonations(donationRepository.countByStatus(DonationStatus.EXPIRED));
        dto.setTotalMealsRescued(donationRepository.sumEstimatedMealsCompleted());

        long uniqueCities = addressRepository.findAll().stream()
                .map(Address::getCity)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .count();
        dto.setCitiesCount(Math.max(1, uniqueCities));

        // Top Suppliers
        List<Organization> allOrgs = organizationRepository.findAll();
        List<Organization> supplierOrgs = allOrgs.stream().filter(o -> isSupplier(o.getType())).collect(Collectors.toList());
        List<AdminDashboardDto.SupplierLeaderboardDto> topSuppliers = new ArrayList<>();
        int rank = 1;
        for (Organization org : supplierOrgs) {
            List<Donation> orgDonations = donationRepository.findBySupplierIdOrderByCreatedAtDesc(org.getId());
            int total = orgDonations.size();
            int completed = 0;
            int meals = 0;
            for (Donation d : orgDonations) {
                if (d.getStatus() == DonationStatus.COMPLETED) {
                    completed++;
                    meals += d.getEstimatedServings();
                }
            }
            double rate = total > 0 ? ((double) completed / total) * 100.0 : 0.0;
            String city = org.getAddress() != null ? org.getAddress().getCity() : "Hyderabad";
            topSuppliers.add(new AdminDashboardDto.SupplierLeaderboardDto(
                    rank++, org.getName(), city, total, completed, meals, Math.round(rate * 10.0) / 10.0
            ));
        }
        topSuppliers.sort((a, b) -> Integer.compare(b.getMealsSupplied(), a.getMealsSupplied()));
        for (int i = 0; i < topSuppliers.size(); i++) {
            topSuppliers.get(i).setRank(i + 1);
        }
        dto.setTopSuppliers(topSuppliers.stream().limit(5).collect(Collectors.toList()));

        // Top Volunteers
        List<VolunteerProfile> activeVolunteers = volunteerProfileRepository.findByVerificationStatus(VerificationStatus.ACTIVE);
        List<AdminDashboardDto.VolunteerLeaderboardDto> topVolunteers = new ArrayList<>();
        int vRank = 1;
        for (VolunteerProfile vp : activeVolunteers) {
            String name = vp.getUser().getUserProfile() != null ? vp.getUser().getUserProfile().getFullName() : vp.getUser().getEmail().split("@")[0];
            String city = vp.getUser().getUserProfile() != null && vp.getUser().getUserProfile().getCity() != null
                    ? vp.getUser().getUserProfile().getCity() : "Hyderabad";
            topVolunteers.add(new AdminDashboardDto.VolunteerLeaderboardDto(
                    vRank++,
                    name,
                    vp.getVolunteerCode() != null ? vp.getVolunteerCode() : "VOL-10001",
                    city,
                    vp.getOrganizationsContactedCount(),
                    vp.getOrganizationsOnboardedCount(),
                    vp.getDonationsAssistedCount(),
                    Math.max(1, vp.getOrganizationsOnboardedCount() * 2)
            ));
        }
        topVolunteers.sort((a, b) -> Integer.compare(b.getOrgsOnboarded(), a.getOrgsOnboarded()));
        for (int i = 0; i < topVolunteers.size(); i++) {
            topVolunteers.get(i).setRank(i + 1);
        }
        dto.setTopVolunteers(topVolunteers.stream().limit(5).collect(Collectors.toList()));

        // Beneficiary Analytics
        List<Organization> beneficiaryOrgs = allOrgs.stream().filter(o -> isBeneficiary(o.getType())).collect(Collectors.toList());
        long oldAge = 0, orphanages = 0, others = 0;
        for (Organization bo : beneficiaryOrgs) {
            if (bo.getBeneficiaryDetails() != null && bo.getBeneficiaryDetails().getBeneficiaryType() != null) {
                String bt = bo.getBeneficiaryDetails().getBeneficiaryType().toUpperCase();
                if (bt.contains("OLD_AGE")) oldAge++;
                else if (bt.contains("ORPHAN")) orphanages++;
                else others++;
            } else {
                others++;
            }
        }
        dto.setBeneficiaryAnalytics(new AdminDashboardDto.BeneficiaryAnalyticsDto(
                beneficiaryOrgs.size(),
                oldAge,
                orphanages,
                others,
                dto.getTotalMealsRescued(),
                dto.getCompletedDonations()
        ));

        return dto;
    }

    @Transactional(readOnly = true)
    public List<AdminVolunteerVerificationDto> getPendingVolunteers() {
        return volunteerProfileRepository.findByVerificationStatus(VerificationStatus.PENDING_VERIFICATION)
                .stream()
                .map(this::mapVolunteerToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VolunteerProfile approveVolunteer(UUID volunteerUserId, UUID adminUserId) {
        return volunteerService.approveVolunteer(volunteerUserId, adminUserId);
    }

    @Transactional
    public VolunteerProfile rejectVolunteer(UUID volunteerUserId, UUID adminUserId, String reason) {
        return volunteerService.rejectVolunteer(volunteerUserId, adminUserId, reason);
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserDto suspendUser(UUID userId, UUID adminUserId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.SUSPENDED);
        User saved = userRepository.save(user);

        auditService.log(adminUserId, "SUSPEND_USER", "USER", userId, null, "Suspended. Reason: " + reason);

        return mapUserToDto(saved);
    }

    @Transactional
    public AdminUserDto reactivateUser(UUID userId, UUID adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);

        auditService.log(adminUserId, "REACTIVATE_USER", "USER", userId, null, "Reactivated user account");

        return mapUserToDto(saved);
    }

    @Transactional
    public void deleteUser(UUID userId, UUID adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.DELETED);
        userRepository.save(user);

        auditService.log(adminUserId, "DELETE_USER", "USER", userId, null, "Soft deleted user account");
    }

    @Transactional(readOnly = true)
    public List<AdminReportDto> getReports() {
        return reportRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapReportToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminReportDto resolveReport(UUID reportId, UUID adminUserId, String adminNotes) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        User admin = userRepository.findById(adminUserId).orElse(null);

        report.setStatus(ReportStatus.RESOLVED);
        report.setAdminNotes(adminNotes);
        report.setResolvedByAdmin(admin);

        Report saved = reportRepository.save(report);
        auditService.log(adminUserId, "RESOLVE_REPORT", "REPORT", reportId, null, "Resolved report: " + adminNotes);

        return mapReportToDto(saved);
    }

    @Transactional
    public AdminReportDto dismissReport(UUID reportId, UUID adminUserId, String adminNotes) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        User admin = userRepository.findById(adminUserId).orElse(null);

        report.setStatus(ReportStatus.DISMISSED);
        report.setAdminNotes(adminNotes);
        report.setResolvedByAdmin(admin);

        Report saved = reportRepository.save(report);
        auditService.log(adminUserId, "DISMISS_REPORT", "REPORT", reportId, null, "Dismissed report: " + adminNotes);

        return mapReportToDto(saved);
    }

    private AdminVolunteerVerificationDto mapVolunteerToDto(VolunteerProfile vp) {
        AdminVolunteerVerificationDto dto = new AdminVolunteerVerificationDto();
        dto.setProfileId(vp.getId());
        dto.setUserId(vp.getUser().getId());
        dto.setEmail(vp.getUser().getEmail());
        dto.setVerificationStatus(vp.getVerificationStatus().name());
        dto.setIdProofType(vp.getIdProofType());
        dto.setIdProofNumber(vp.getIdProofNumber());
        dto.setIdProofDocumentUrl(vp.getIdProofDocumentUrl());
        dto.setProfilePhotoUrl(vp.getProfilePhotoUrl());
        dto.setServiceArea(vp.getServiceArea());
        dto.setInterests(vp.getInterests());
        dto.setCreatedAt(vp.getCreatedAt());

        if (vp.getUser().getUserProfile() != null) {
            UserProfile up = vp.getUser().getUserProfile();
            dto.setFullName(up.getFullName());
            dto.setPhone(up.getPhone());
            if (up.getAvatarUrl() != null && !up.getAvatarUrl().trim().isEmpty()) {
                dto.setProfilePhotoUrl(up.getAvatarUrl());
            }
            if (up.getCity() != null) {
                dto.setCity(up.getCity());
            }
        }
        return dto;
    }

    private AdminUserDto mapUserToDto(User u) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setStatus(u.getStatus().name());
        dto.setCreatedAt(u.getCreatedAt());

        if (!u.getRoles().isEmpty()) {
            dto.setRole(u.getRoles().iterator().next().getName());
        }

        if (u.getUserProfile() != null) {
            dto.setFullName(u.getUserProfile().getFullName());
            dto.setPhone(u.getUserProfile().getPhone());
            if (u.getUserProfile().getCity() != null) {
                dto.setCity(u.getUserProfile().getCity());
            }
        }

        organizationMemberRepository.findByUserId(u.getId()).ifPresent(member -> {
            Organization org = member.getOrganization();
            dto.setOrganizationName(org.getName());
            dto.setOrganizationType(org.getType().name());
            if (org.getAddress() != null && dto.getCity() == null) {
                dto.setCity(org.getAddress().getCity());
            }
        });

        volunteerProfileRepository.findByUserId(u.getId()).ifPresent(vp -> {
            dto.setVolunteerCode(vp.getVolunteerCode());
        });

        return dto;
    }

    private AdminReportDto mapReportToDto(Report r) {
        AdminReportDto dto = new AdminReportDto();
        dto.setId(r.getId());
        dto.setTargetType(r.getTargetType());
        dto.setTargetId(r.getTargetId());
        dto.setReason(r.getReason());
        dto.setDescription(r.getDescription());
        dto.setStatus(r.getStatus().name());
        dto.setAdminNotes(r.getAdminNotes());
        dto.setCreatedAt(r.getCreatedAt());

        if (r.getReporterUser() != null) {
            dto.setReporterEmail(r.getReporterUser().getEmail());
            if (r.getReporterUser().getUserProfile() != null) {
                dto.setReporterName(r.getReporterUser().getUserProfile().getFullName());
            } else {
                dto.setReporterName(r.getReporterUser().getEmail().split("@")[0]);
            }
        }

        return dto;
    }

    private boolean isSupplier(OrganizationType type) {
        return type == OrganizationType.RESTAURANT || type == OrganizationType.BAKERY ||
               type == OrganizationType.CATERER || type == OrganizationType.CORPORATE_CAFETERIA;
    }

    private boolean isBeneficiary(OrganizationType type) {
        return type == OrganizationType.OLD_AGE_HOME || type == OrganizationType.ORPHANAGE ||
               type == OrganizationType.COMMUNITY_SHELTER;
    }
}
