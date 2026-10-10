package org.sharingfood.service;

import org.sharingfood.dto.*;
import org.sharingfood.entity.*;
import org.sharingfood.exception.BadRequestException;
import org.sharingfood.exception.ForbiddenException;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.InAppNotificationRepository;
import org.sharingfood.repository.UserRepository;
import org.sharingfood.repository.VolunteerActivityRepository;
import org.sharingfood.repository.VolunteerLeadRepository;
import org.sharingfood.repository.VolunteerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VolunteerService {

    private final VolunteerProfileRepository volunteerProfileRepository;
    private final UserRepository userRepository;
    private final InAppNotificationRepository notificationRepository;
    private final VolunteerLeadRepository volunteerLeadRepository;
    private final VolunteerActivityRepository volunteerActivityRepository;
    private final AuditService auditService;

    public VolunteerService(
            VolunteerProfileRepository volunteerProfileRepository,
            UserRepository userRepository,
            InAppNotificationRepository notificationRepository,
            VolunteerLeadRepository volunteerLeadRepository,
            VolunteerActivityRepository volunteerActivityRepository,
            AuditService auditService) {
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.volunteerLeadRepository = volunteerLeadRepository;
        this.volunteerActivityRepository = volunteerActivityRepository;
        this.auditService = auditService;
    }

    /**
     * Section 53.3: Validate that the submitted Volunteer ID belongs to an ACTIVE verified Volunteer.
     */
    @Transactional(readOnly = true)
    public Optional<VolunteerProfile> validateActiveVolunteer(String volunteerCode) {
        if (volunteerCode == null || volunteerCode.trim().isEmpty()) {
            return Optional.empty();
        }
        Optional<VolunteerProfile> profileOpt = volunteerProfileRepository.findByVolunteerCode(volunteerCode.trim().toUpperCase());
        if (profileOpt.isEmpty()) {
            throw new BadRequestException("Invalid Volunteer ID: " + volunteerCode);
        }
        VolunteerProfile profile = profileOpt.get();
        if (profile.getVerificationStatus() != VerificationStatus.ACTIVE) {
            throw new BadRequestException("Volunteer with ID " + volunteerCode + " is not currently active and verified.");
        }
        if (profile.getUser().getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Volunteer account is suspended or inactive.");
        }
        return Optional.of(profile);
    }

    @Transactional
    public void incrementOnboardedCount(UUID volunteerUserId) {
        if (volunteerUserId != null) {
            volunteerProfileRepository.findByUserId(volunteerUserId).ifPresent(vp -> {
                vp.setOrganizationsOnboardedCount(vp.getOrganizationsOnboardedCount() + 1);
                volunteerProfileRepository.save(vp);
            });
        }
    }

    /**
     * Section 53.1 & 53.2: Only App Admin can approve volunteer verification.
     * Generates a unique immutable Volunteer ID and activates the account.
     */
    @Transactional
    public VolunteerProfile approveVolunteer(UUID volunteerUserId, UUID adminUserId) {
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(volunteerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user: " + volunteerUserId));

        if (profile.getVerificationStatus() == VerificationStatus.ACTIVE && profile.getVolunteerCode() != null) {
            return profile; // Already verified
        }

        // Generate unique Volunteer ID e.g. VOL-10001
        String uniqueCode = generateUniqueVolunteerCode();
        profile.setVolunteerCode(uniqueCode);
        profile.setVerificationStatus(VerificationStatus.ACTIVE);
        profile.setVerifiedAt(Instant.now());
        profile.setVerifiedByAdminId(adminUserId);
        profile.setRejectionReason(null);

        VolunteerProfile saved = volunteerProfileRepository.save(profile);

        // Notify Volunteer in-app
        InAppNotification notification = new InAppNotification(
                profile.getUser(),
                "Volunteer Account Verified!",
                "Your Volunteer account has been verified and activated. Your unique Volunteer ID is " + uniqueCode + ".",
                "VOLUNTEER_VERIFIED",
                "/volunteer/dashboard"
        );
        notificationRepository.save(notification);

        auditService.log(adminUserId, "APPROVE_VOLUNTEER", "VOLUNTEER", volunteerUserId, null, "Approved with code " + uniqueCode);

        return saved;
    }

    /**
     * Section 53.1: Only App Admin can reject volunteer verification.
     */
    @Transactional
    public VolunteerProfile rejectVolunteer(UUID volunteerUserId, UUID adminUserId, String reason) {
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(volunteerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user: " + volunteerUserId));

        profile.setVerificationStatus(VerificationStatus.REJECTED);
        profile.setRejectionReason(reason);
        profile.setVerifiedByAdminId(adminUserId);

        VolunteerProfile saved = volunteerProfileRepository.save(profile);

        // Notify Volunteer in-app
        InAppNotification notification = new InAppNotification(
                profile.getUser(),
                "Volunteer Verification Update",
                "Your volunteer verification was not approved. Reason: " + (reason != null ? reason : "Documentation incomplete") + ". You may re-submit valid credentials.",
                "VOLUNTEER_REJECTED",
                "/profile"
        );
        notificationRepository.save(notification);

        auditService.log(adminUserId, "REJECT_VOLUNTEER", "VOLUNTEER", volunteerUserId, null, "Rejected. Reason: " + reason);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<VolunteerProfile> getPendingVerifications() {
        return volunteerProfileRepository.findByVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
    }

    @Transactional(readOnly = true)
    public VolunteerDashboardDto getDashboard(User user) {
        VolunteerProfile profile = volunteerProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    VolunteerProfile vp = new VolunteerProfile();
                    vp.setUser(user);
                    vp.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
                    return volunteerProfileRepository.save(vp);
                });

        VolunteerDashboardDto dto = new VolunteerDashboardDto();
        dto.setVolunteerCode(profile.getVolunteerCode());
        dto.setVerificationStatus(profile.getVerificationStatus().name());
        dto.setRejectionReason(profile.getRejectionReason());
        dto.setOrganizationsContactedCount(profile.getOrganizationsContactedCount());
        dto.setOrganizationsOnboardedCount(profile.getOrganizationsOnboardedCount());
        dto.setDonationsAssistedCount(profile.getDonationsAssistedCount());

        List<VolunteerActivity> activities = volunteerActivityRepository.findByVolunteerUserIdOrderByActivityDateDesc(user.getId());
        dto.setActivitiesCompletedCount(activities.size());

        BigDecimal totalHours = activities.stream()
                .map(a -> a.getHoursSpent() != null ? a.getHoursSpent() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalHoursSpent(totalHours);

        long distinctDays = activities.stream()
                .map(VolunteerActivity::getActivityDate)
                .distinct()
                .count();
        dto.setActiveDaysCount((int) distinctDays);

        List<VolunteerLead> leads = volunteerLeadRepository.findByVolunteerUserIdOrderByCreatedAtDesc(user.getId());
        dto.setRecentLeads(leads.stream().limit(5).map(this::mapLeadToDto).collect(Collectors.toList()));
        dto.setRecentActivities(activities.stream().limit(5).map(this::mapActivityToDto).collect(Collectors.toList()));

        return dto;
    }

    @Transactional(readOnly = true)
    public List<VolunteerLeadDto> getLeads(User user) {
        return volunteerLeadRepository.findByVolunteerUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapLeadToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VolunteerLeadDto createLead(CreateVolunteerLeadRequest req, User user) {
        VolunteerLead lead = new VolunteerLead(
                user,
                req.getOrganizationName(),
                req.getOrganizationType(),
                req.getContactName(),
                req.getPhone(),
                req.getEmail(),
                req.getAddress(),
                req.getCity(),
                req.getNotes()
        );

        VolunteerLead saved = volunteerLeadRepository.save(lead);

        // Update volunteer stats
        volunteerProfileRepository.findByUserId(user.getId()).ifPresent(vp -> {
            vp.setOrganizationsContactedCount(vp.getOrganizationsContactedCount() + 1);
            volunteerProfileRepository.save(vp);
        });

        auditService.log(user, "CREATE_LEAD", "VOLUNTEER_LEAD", saved.getId(), "Logged outreach lead for " + req.getOrganizationName());

        return mapLeadToDto(saved);
    }

    @Transactional
    public VolunteerLeadDto updateLeadStatus(UUID leadId, String status, String notes, User user) {
        VolunteerLead lead = volunteerLeadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + leadId));

        if (!lead.getVolunteerUser().getId().equals(user.getId())) {
            throw new ForbiddenException("Cannot update another volunteer's lead");
        }

        lead.setStatus(status.toUpperCase());
        if (notes != null && !notes.trim().isEmpty()) {
            lead.setNotes(notes);
        }

        VolunteerLead saved = volunteerLeadRepository.save(lead);
        return mapLeadToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<VolunteerActivityDto> getActivities(User user) {
        return volunteerActivityRepository.findByVolunteerUserIdOrderByActivityDateDesc(user.getId())
                .stream()
                .map(this::mapActivityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VolunteerActivityDto createActivity(CreateVolunteerActivityRequest req, User user) {
        VolunteerActivity activity = new VolunteerActivity(
                user,
                req.getActivityType(),
                req.getDescription(),
                req.getHoursSpent(),
                req.getActivityDate() != null ? req.getActivityDate() : java.time.LocalDate.now()
        );

        VolunteerActivity saved = volunteerActivityRepository.save(activity);
        auditService.log(user, "LOG_ACTIVITY", "VOLUNTEER_ACTIVITY", saved.getId(), "Logged " + req.getHoursSpent() + "h for " + req.getActivityType());
        return mapActivityToDto(saved);
    }

    @Transactional(readOnly = true)
    public VolunteerDashboardDto getDashboard(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return getDashboard(user);
    }

    @Transactional(readOnly = true)
    public List<VolunteerLeadDto> getLeads(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return getLeads(user);
    }

    @Transactional
    public VolunteerLeadDto createLead(CreateVolunteerLeadRequest req, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return createLead(req, user);
    }

    @Transactional
    public VolunteerLeadDto updateLeadStatus(UUID leadId, String status, String notes, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return updateLeadStatus(leadId, status, notes, user);
    }

    @Transactional(readOnly = true)
    public List<VolunteerActivityDto> getActivities(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return getActivities(user);
    }

    @Transactional
    public VolunteerActivityDto createActivity(CreateVolunteerActivityRequest req, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return createActivity(req, user);
    }

    public VolunteerLeadDto mapLeadToDto(VolunteerLead l) {
        return new VolunteerLeadDto(
                l.getId(),
                l.getOrganizationName(),
                l.getOrganizationType(),
                l.getContactName(),
                l.getPhone(),
                l.getEmail(),
                l.getAddress(),
                l.getCity(),
                l.getStatus(),
                l.getNotes(),
                l.getCreatedAt()
        );
    }

    public VolunteerActivityDto mapActivityToDto(VolunteerActivity a) {
        return new VolunteerActivityDto(
                a.getId(),
                a.getActivityType(),
                a.getDescription(),
                a.getHoursSpent(),
                a.getActivityDate(),
                a.getCreatedAt()
        );
    }

    private String generateUniqueVolunteerCode() {
        Random random = new Random();
        String code;
        do {
            int num = 10000 + random.nextInt(90000);
            code = "VOL-" + num;
        } while (volunteerProfileRepository.existsByVolunteerCode(code));
        return code;
    }
}
