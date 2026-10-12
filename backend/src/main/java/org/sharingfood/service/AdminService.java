package org.sharingfood.service;

import org.sharingfood.dto.*;
import org.sharingfood.entity.*;
import org.sharingfood.exception.BadRequestException;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.*;
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
    private final DonationRepository donationRepository;
    private final ReportRepository reportRepository;
    private final AddressRepository addressRepository;
    private final BeneficiaryDetailsRepository beneficiaryDetailsRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AdminService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            DonationRepository donationRepository,
            ReportRepository reportRepository,
            AddressRepository addressRepository,
            BeneficiaryDetailsRepository beneficiaryDetailsRepository,
            NotificationService notificationService,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.donationRepository = donationRepository;
        this.reportRepository = reportRepository;
        this.addressRepository = addressRepository;
        this.beneficiaryDetailsRepository = beneficiaryDetailsRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard() {
        AdminDashboardDto dto = new AdminDashboardDto();

        List<User> allUsers = userRepository.findAll();
        long validUsersCount = 0;

        long suppliers = 0, beneficiaries = 0;
        long pendingSuppliers = 0, pendingBeneficiaries = 0;
        long approved = 0, rejected = 0, suspended = 0;

        for (User u : allUsers) {
            // Unverified registrations must NEVER appear or be counted in Admin Approval Dashboard
            if (u.getStatus() == UserStatus.DELETED || u.getStatus() == UserStatus.PENDING_OTP_VERIFICATION) {
                continue;
            }
            validUsersCount++;

            boolean isSupplier = u.getRoles().stream().anyMatch(r -> "ROLE_SUPPLIER".equals(r.getName()));
            boolean isBeneficiary = u.getRoles().stream().anyMatch(r -> "ROLE_BENEFICIARY".equals(r.getName()));

            if (isSupplier) suppliers++;
            if (isBeneficiary) beneficiaries++;

            if (u.getStatus() == UserStatus.PENDING_ADMIN_APPROVAL || u.getStatus() == UserStatus.PENDING_APPROVAL || u.getStatus() == UserStatus.PENDING_VERIFICATION) {
                if (isSupplier) pendingSuppliers++;
                if (isBeneficiary) pendingBeneficiaries++;
            } else if (u.getStatus() == UserStatus.APPROVED || u.getStatus() == UserStatus.ACTIVE) {
                approved++;
            } else if (u.getStatus() == UserStatus.REJECTED) {
                rejected++;
            } else if (u.getStatus() == UserStatus.SUSPENDED) {
                suspended++;
            }
        }

        dto.setTotalUsers(validUsersCount);

        dto.setTotalSuppliers(suppliers);
        dto.setTotalBeneficiaries(beneficiaries);
        dto.setPendingSupplierApprovals(pendingSuppliers);
        dto.setPendingBeneficiaryApprovals(pendingBeneficiaries);
        dto.setApprovedAccounts(approved);
        dto.setRejectedAccounts(rejected);
        dto.setSuspendedAccounts(suspended);

        dto.setTotalDonations(donationRepository.count());
        dto.setAvailableDonations(donationRepository.countByStatus(DonationStatus.AVAILABLE));
        dto.setReservedDonations(donationRepository.countByStatus(DonationStatus.RESERVED));
        long completed = donationRepository.countByStatus(DonationStatus.COMPLETED);
        dto.setCompletedDonations(completed);
        dto.setTotalPickupsCompleted(completed);
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

        // Top Suppliers Leaderboard
        List<Organization> allOrgs = organizationRepository.findAll();
        List<Organization> supplierOrgs = allOrgs.stream().filter(o -> isSupplier(o.getType())).collect(Collectors.toList());
        List<AdminDashboardDto.SupplierLeaderboardDto> topSuppliers = new ArrayList<>();
        int rank = 1;
        for (Organization org : supplierOrgs) {
            List<Donation> orgDonations = donationRepository.findBySupplierIdOrderByCreatedAtDesc(org.getId());
            int total = orgDonations.size();
            int completedCount = 0;
            int meals = 0;
            for (Donation d : orgDonations) {
                if (d.getStatus() == DonationStatus.COMPLETED) {
                    completedCount++;
                    meals += d.getEstimatedServings();
                }
            }
            double rate = total > 0 ? ((double) completedCount / total) * 100.0 : 0.0;
            String city = org.getAddress() != null ? org.getAddress().getCity() : "Hyderabad";
            topSuppliers.add(new AdminDashboardDto.SupplierLeaderboardDto(
                    rank++, org.getName(), city, total, completedCount, meals, Math.round(rate * 10.0) / 10.0
            ));
        }
        topSuppliers.sort((a, b) -> Integer.compare(b.getMealsSupplied(), a.getMealsSupplied()));
        for (int i = 0; i < topSuppliers.size(); i++) {
            topSuppliers.get(i).setRank(i + 1);
        }
        dto.setTopSuppliers(topSuppliers.stream().limit(5).collect(Collectors.toList()));

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
                completed
        ));

        return dto;
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getStatus() != UserStatus.DELETED && u.getStatus() != UserStatus.PENDING_OTP_VERIFICATION)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapUserToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AdminUserDto getUserDetails(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapUserToDto(user);
    }

    @Transactional
    public AdminUserDto approveUser(UUID userId, UUID adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.APPROVED);
        user.setStatusReason(null);
        user.setReviewedByAdminId(adminUserId);
        user.setReviewedAt(Instant.now());
        User saved = userRepository.save(user);

        // Activate organization
        organizationMemberRepository.findByUser(user).ifPresent(member -> {
            Organization org = member.getOrganization();
            org.setActive(true);
            organizationRepository.save(org);
        });

        auditService.log(adminUserId, "APPROVE_USER", "USER", userId, null, "Approved account registration");

        // Notify user
        try {
            notificationService.createNotification(
                    user,
                    "Account Approved",
                    "Congratulations! Your account has been approved by platform administration. You can now access all operational features.",
                    "ACCOUNT_APPROVED",
                    "/supplier/dashboard"
            );
        } catch (Exception ignored) {}

        return mapUserToDto(saved);
    }

    @Transactional
    public AdminUserDto rejectUser(UUID userId, UUID adminUserId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("A valid reason is mandatory when rejecting an account registration.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.REJECTED);
        user.setStatusReason(reason.trim());
        user.setReviewedByAdminId(adminUserId);
        user.setReviewedAt(Instant.now());
        User saved = userRepository.save(user);

        // Deactivate organization
        organizationMemberRepository.findByUser(user).ifPresent(member -> {
            Organization org = member.getOrganization();
            org.setActive(false);
            organizationRepository.save(org);
        });

        auditService.log(adminUserId, "REJECT_USER", "USER", userId, null, "Rejected account. Reason: " + reason.trim());

        // Notify user
        try {
            notificationService.createNotification(
                    user,
                    "Registration Rejected",
                    "Your account registration was not approved. Reason: " + reason.trim(),
                    "ACCOUNT_REJECTED",
                    "/account-status"
            );
        } catch (Exception ignored) {}

        return mapUserToDto(saved);
    }

    @Transactional
    public AdminUserDto suspendUser(UUID userId, UUID adminUserId, String reason) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new BadRequestException("A valid reason is mandatory when suspending an account.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.SUSPENDED);
        user.setStatusReason(reason.trim());
        user.setReviewedByAdminId(adminUserId);
        user.setReviewedAt(Instant.now());
        User saved = userRepository.save(user);

        // Deactivate organization
        organizationMemberRepository.findByUser(user).ifPresent(member -> {
            Organization org = member.getOrganization();
            org.setActive(false);
            organizationRepository.save(org);
        });

        auditService.log(adminUserId, "SUSPEND_USER", "USER", userId, null, "Suspended account. Reason: " + reason.trim());

        // Notify user
        try {
            notificationService.createNotification(
                    user,
                    "Account Suspended",
                    "Your account has been suspended by platform administration. Reason: " + reason.trim(),
                    "ACCOUNT_SUSPENDED",
                    "/account-status"
            );
        } catch (Exception ignored) {}

        return mapUserToDto(saved);
    }

    @Transactional
    public AdminUserDto reactivateUser(UUID userId, UUID adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.APPROVED);
        user.setStatusReason(null);
        user.setReviewedByAdminId(adminUserId);
        user.setReviewedAt(Instant.now());
        User saved = userRepository.save(user);

        // Re-activate organization
        organizationMemberRepository.findByUser(user).ifPresent(member -> {
            Organization org = member.getOrganization();
            org.setActive(true);
            organizationRepository.save(org);
        });

        auditService.log(adminUserId, "REACTIVATE_USER", "USER", userId, null, "Reactivated user account");

        // Notify user
        try {
            notificationService.createNotification(
                    user,
                    "Account Reactivated",
                    "Your account has been reinstated and approved by platform administration.",
                    "ACCOUNT_APPROVED",
                    "/supplier/dashboard"
            );
        } catch (Exception ignored) {}

        return mapUserToDto(saved);
    }

    @Transactional
    public void deleteUser(UUID userId, UUID adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(Instant.now());
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

    private AdminUserDto mapUserToDto(User u) {
        AdminUserDto dto = new AdminUserDto();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setStatus(u.getStatus().name());
        dto.setStatusReason(u.getStatusReason());
        dto.setReviewedByAdminId(u.getReviewedByAdminId());
        dto.setReviewedAt(u.getReviewedAt());
        dto.setCreatedAt(u.getCreatedAt());
        dto.setEmailVerified(u.isEmailVerified());
        dto.setPhoneVerified(u.isPhoneVerified());
        dto.setVerificationMethod(u.getVerificationMethod());

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
            dto.setOrganizationId(org.getId());
            dto.setOrganizationName(org.getName());
            dto.setOrganizationType(org.getType().name());
            dto.setOrganizationPhone(org.getContactPhone() != null ? org.getContactPhone() : org.getPublicPhone());
            dto.setOrganizationEmail(org.getContactEmail());
            dto.setPhotoUrl(org.getPhotoUrl());
            dto.setLogoUrl(org.getLogoUrl());
            dto.setLicenseNumber(org.getLicenseNumber());
            dto.setDocumentUrl(org.getDocumentUrl());

            if (org.getAddress() != null) {
                Address a = org.getAddress();
                dto.setStreetAddress(a.getStreetAddress());
                dto.setLocality(a.getAreaLocality());
                dto.setState(a.getState());
                dto.setPostalCode(a.getPostalCode());
                dto.setLatitude(a.getLatitude());
                dto.setLongitude(a.getLongitude());
                if (dto.getCity() == null) {
                    dto.setCity(a.getCity());
                }
            }

            if (org.getBeneficiaryDetails() != null) {
                BeneficiaryDetails bd = org.getBeneficiaryDetails();
                dto.setResidentCount(bd.getResidentCount());
                dto.setFoodCapacityServings(bd.getFoodCapacityServings());
                dto.setDietaryPreferences(bd.getDietaryPreferences());
            }
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
