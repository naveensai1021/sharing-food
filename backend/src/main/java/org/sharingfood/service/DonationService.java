package org.sharingfood.service;

import org.sharingfood.dto.*;
import org.sharingfood.entity.*;
import org.sharingfood.exception.BadRequestException;
import org.sharingfood.exception.DonationAlreadyReservedException;
import org.sharingfood.exception.ForbiddenException;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final UserRepository userRepository;
    private final FoodSafetyDeclarationRepository safetyDeclarationRepository;
    private final DonationAcceptanceRepository acceptanceRepository;
    private final PickupRepository pickupRepository;
    private final DonationStatusHistoryRepository statusHistoryRepository;
    private final InAppNotificationRepository notificationRepository;
    private final GeospatialService geospatialService;
    private final AuditService auditService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final org.sharingfood.security.OtpSecurityUtil otpSecurityUtil;
    private final EmailService emailService;

    public DonationService(
            DonationRepository donationRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            UserRepository userRepository,
            FoodSafetyDeclarationRepository safetyDeclarationRepository,
            DonationAcceptanceRepository acceptanceRepository,
            PickupRepository pickupRepository,
            DonationStatusHistoryRepository statusHistoryRepository,
            InAppNotificationRepository notificationRepository,
            GeospatialService geospatialService,
            AuditService auditService,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            org.sharingfood.security.OtpSecurityUtil otpSecurityUtil,
            EmailService emailService) {
        this.donationRepository = donationRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.userRepository = userRepository;
        this.safetyDeclarationRepository = safetyDeclarationRepository;
        this.acceptanceRepository = acceptanceRepository;
        this.pickupRepository = pickupRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.notificationRepository = notificationRepository;
        this.geospatialService = geospatialService;
        this.auditService = auditService;
        this.passwordEncoder = passwordEncoder;
        this.otpSecurityUtil = otpSecurityUtil;
        this.emailService = emailService;
    }

    @Transactional
    public DonationDto createDonation(UUID supplierUserId, CreateDonationRequest request) {
        User user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + supplierUserId));

        OrganizationMember member = organizationMemberRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("User does not belong to any organization."));

        Organization supplierOrg = member.getOrganization();

        // Enforce same-day food rescue checks
        if (request.getPickupAvailableUntil().isBefore(request.getPickupAvailableFrom())) {
            throw new BadRequestException("Pickup deadline cannot be before pickup start time.");
        }
        if (request.getConsumeBeforeTime().isBefore(request.getPickupAvailableFrom())) {
            throw new BadRequestException("Safe consumption deadline must be after pickup start time.");
        }
        if (!request.isSafetyDeclarationConfirmed()) {
            throw new BadRequestException("Food safety declaration confirmation is mandatory before publishing.");
        }

        Donation donation = new Donation();
        donation.setSupplier(supplierOrg);
        donation.setCreatedByUser(user);
        donation.setTitle(request.getTitle().trim());
        donation.setDescription(request.getDescription());
        donation.setFoodCategory(request.getFoodCategory());
        donation.setDietaryType(request.getDietaryType());
        donation.setApproximateQuantity(request.getApproximateQuantity());
        donation.setQuantityUnit(request.getQuantityUnit());
        donation.setEstimatedServings(request.getEstimatedServings());
        donation.setPreparationTime(request.getPreparationTime());
        donation.setPickupAvailableFrom(request.getPickupAvailableFrom());
        donation.setPickupAvailableUntil(request.getPickupAvailableUntil());
        donation.setConsumeBeforeTime(request.getConsumeBeforeTime());
        donation.setPackagingStatus(request.getPackagingStatus());
        donation.setAllergens(request.getAllergens());
        donation.setSpecialInstructions(request.getSpecialInstructions());
        donation.setPickupInstructions(request.getPickupInstructions());
        donation.setStatus(DonationStatus.AVAILABLE);

        // Address resolution
        if (request.getStreetAddress() != null && request.getLatitude() != null && request.getLongitude() != null) {
            Address address = new Address(
                    request.getStreetAddress(),
                    request.getCity() != null ? request.getCity() : supplierOrg.getAddress().getCity(),
                    request.getState(),
                    request.getPostalCode(),
                    request.getLatitude(),
                    request.getLongitude()
            );
            donation.setPickupAddress(address);
        } else if (supplierOrg.getAddress() != null) {
            donation.setPickupAddress(supplierOrg.getAddress());
        }

        // Food Items
        if (request.getFoodItems() != null) {
            for (CreateDonationRequest.FoodItemDto itemDto : request.getFoodItems()) {
                if (itemDto.getItemName() != null && !itemDto.getItemName().trim().isEmpty()) {
                    DonationFoodItem foodItem = new DonationFoodItem(itemDto.getItemName().trim(), itemDto.getQuantity());
                    donation.addFoodItem(foodItem);
                }
            }
        }

        // Images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            boolean first = true;
            for (String imgUrl : request.getImageUrls()) {
                if (imgUrl != null && !imgUrl.trim().isEmpty()) {
                    DonationImage image = new DonationImage(imgUrl.trim(), first);
                    donation.addImage(image);
                    first = false;
                }
            }
        }

        Donation savedDonation = donationRepository.save(donation);

        // Record Food Safety Declaration (Section 16)
        FoodSafetyDeclaration declaration = new FoodSafetyDeclaration(
                savedDonation,
                user,
                "I confirm that this food is safe for consumption, has been stored appropriately, and has not been served directly to customers.",
                "1.0"
        );
        safetyDeclarationRepository.save(declaration);

        // Record Status History
        DonationStatusHistory history = new DonationStatusHistory(
                savedDonation,
                null,
                DonationStatus.AVAILABLE.name(),
                user,
                "Donation posted with verified food safety pledge"
        );
        statusHistoryRepository.save(history);

        auditService.log(user.getId(), "CREATE_DONATION", "DONATION", savedDonation.getId(), null, "Created donation: " + savedDonation.getTitle());

        return toDto(savedDonation, null, null);
    }

    @Transactional(readOnly = true)
    public List<DonationDto> getDonationsForSupplier(UUID supplierUserId) {
        User user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + supplierUserId));

        OrganizationMember member = organizationMemberRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("User does not belong to any organization."));

        return donationRepository.findBySupplierIdOrderByCreatedAtDesc(member.getOrganization().getId())
                .stream()
                .map(d -> toDto(d, null, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DonationDto> getDonationsForBeneficiary(UUID beneficiaryUserId) {
        User user = userRepository.findById(beneficiaryUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + beneficiaryUserId));

        OrganizationMember member = organizationMemberRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("User does not belong to any organization."));

        return donationRepository.findByBeneficiaryId(member.getOrganization().getId())
                .stream()
                .map(d -> toDto(d, null, null))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupplierSummaryDto getSupplierSummary(UUID supplierUserId) {
        User user = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + supplierUserId));

        OrganizationMember member = organizationMemberRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("User does not belong to any organization."));

        List<Donation> donations = donationRepository.findBySupplierIdOrderByCreatedAtDesc(member.getOrganization().getId());

        SupplierSummaryDto summary = new SupplierSummaryDto();
        summary.setTotalDonations(donations.size());

        int active = 0;
        int completed = 0;
        int totalServings = 0;
        Set<UUID> beneficiaryIds = new HashSet<>();

        for (Donation d : donations) {
            if (d.getStatus() == DonationStatus.COMPLETED) {
                completed++;
                totalServings += d.getEstimatedServings();
                if (d.getAcceptance() != null && d.getAcceptance().getBeneficiary() != null) {
                    beneficiaryIds.add(d.getAcceptance().getBeneficiary().getId());
                }
            } else if (d.getStatus() == DonationStatus.AVAILABLE ||
                       d.getStatus() == DonationStatus.RESERVED ||
                       d.getStatus() == DonationStatus.READY_FOR_PICKUP ||
                       d.getStatus() == DonationStatus.PICKUP_IN_PROGRESS) {
                active++;
            }
        }

        summary.setActiveDonations(active);
        summary.setCompletedDonations(completed);
        summary.setTotalServingsDonated(totalServings);
        summary.setBeneficiariesHelped(beneficiaryIds.size());
        summary.setRecentDonations(donations.stream().limit(5).map(d -> toDto(d, null, null)).collect(Collectors.toList()));

        return summary;
    }

    @Transactional(readOnly = true)
    public BeneficiarySummaryDto getBeneficiarySummary(UUID beneficiaryUserId) {
        User user = userRepository.findById(beneficiaryUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + beneficiaryUserId));

        OrganizationMember member = organizationMemberRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("User does not belong to any organization."));

        List<Donation> claimed = donationRepository.findByBeneficiaryId(member.getOrganization().getId());

        BeneficiarySummaryDto summary = new BeneficiarySummaryDto();
        summary.setTotalClaimed(claimed.size());

        int activePickups = 0;
        int completedPickups = 0;
        int totalServings = 0;

        for (Donation d : claimed) {
            if (d.getStatus() == DonationStatus.COMPLETED || d.getStatus() == DonationStatus.COLLECTED) {
                completedPickups++;
                totalServings += d.getEstimatedServings();
            } else if (d.getStatus() == DonationStatus.RESERVED ||
                       d.getStatus() == DonationStatus.READY_FOR_PICKUP ||
                       d.getStatus() == DonationStatus.PICKUP_IN_PROGRESS) {
                activePickups++;
            }
        }

        summary.setActivePickups(activePickups);
        summary.setCompletedPickups(completedPickups);
        summary.setTotalServingsReceived(totalServings);
        summary.setAvailableNearbyCount((int) donationRepository.countByStatus(DonationStatus.AVAILABLE));
        summary.setRecentPickups(claimed.stream().limit(5).map(d -> toDto(d, null, null)).collect(Collectors.toList()));

        return summary;
    }

    @Transactional(readOnly = true)
    public DonationDto getDonationDetails(UUID donationId, BigDecimal userLat, BigDecimal userLon) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));
        return toDto(donation, userLat, userLon);
    }

    @Transactional(readOnly = true)
    public List<DonationDto> getNearbyDonations(
            BigDecimal userLat,
            BigDecimal userLon,
            double radiusKm,
            FoodCategory category,
            DietaryType dietary) {
        Instant now = Instant.now();
        List<Donation> availableDonations = donationRepository.findByStatusOrderByCreatedAtDesc(DonationStatus.AVAILABLE);

        return availableDonations.stream()
                .filter(d -> d.getPickupAvailableUntil().isAfter(now))
                .filter(d -> category == null || d.getFoodCategory() == category)
                .filter(d -> dietary == null || d.getDietaryType() == dietary)
                .map(d -> {
                    BigDecimal dLat = d.getPickupAddress() != null ? d.getPickupAddress().getLatitude() : null;
                    BigDecimal dLon = d.getPickupAddress() != null ? d.getPickupAddress().getLongitude() : null;
                    double distance = geospatialService.calculateDistanceKm(userLat, userLon, dLat, dLon);
                    DonationDto dto = toDto(d, userLat, userLon);
                    dto.setDistanceKm(distance < Double.MAX_VALUE ? Math.round(distance * 10.0) / 10.0 : null);
                    return dto;
                })
                .filter(dto -> dto.getDistanceKm() == null || dto.getDistanceKm() <= radiusKm)
                .sorted(Comparator.comparing(d -> d.getDistanceKm() != null ? d.getDistanceKm() : 9999.0))
                .collect(Collectors.toList());
    }

    /**
     * CRITICAL CONCURRENCY REQUIREMENT:
     * Prevent double acceptance on backend using pessimistic write lock.
     * Beneficiary A accepts -> RESERVED.
     * Beneficiary B attempts acceptance milliseconds later -> 409 Conflict:
     * "This donation has already been accepted by another organization."
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public DonationDto acceptDonation(UUID donationId, UUID beneficiaryUserId) {
        User user = userRepository.findById(beneficiaryUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + beneficiaryUserId));

        OrganizationMember member = organizationMemberRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("User does not belong to a registered beneficiary organization."));

        Organization beneficiaryOrg = member.getOrganization();

        // Pessimistic DB write lock on the donation record
        Donation donation = donationRepository.findByIdForUpdate(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new DonationAlreadyReservedException("This donation has already been accepted by another organization.");
        }

        if (donation.getPickupAvailableUntil().isBefore(Instant.now())) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            throw new BadRequestException("This donation has expired and can no longer be accepted.");
        }

        // Transition status to RESERVED
        DonationStatus previousStatus = donation.getStatus();
        donation.setStatus(DonationStatus.RESERVED);

        // Record Acceptance
        DonationAcceptance acceptance = new DonationAcceptance(donation, beneficiaryOrg, user);
        acceptance.setStatus("PENDING");
        donation.setAcceptance(acceptance);
        acceptanceRepository.save(acceptance);

        // Initialize Pickup record
        Pickup pickup = new Pickup(donation, acceptance);
        donation.setPickup(pickup);
        pickupRepository.save(pickup);

        Donation saved = donationRepository.save(donation);

        // Status history
        DonationStatusHistory history = new DonationStatusHistory(
                saved,
                previousStatus.name(),
                DonationStatus.RESERVED.name(),
                user,
                "Accepted by beneficiary: " + beneficiaryOrg.getName()
        );
        statusHistoryRepository.save(history);

        // Notify Supplier
        organizationMemberRepository.findByOrganization(donation.getSupplier()).forEach(supplierMember -> {
            InAppNotification notif = new InAppNotification(
                    supplierMember.getUser(),
                    "Donation Accepted!",
                    beneficiaryOrg.getName() + " has accepted your donation of " + donation.getTitle() + ".",
                    "DONATION_ACCEPTED",
                    "/supplier/donations"
            );
            notificationRepository.save(notif);
        });

        auditService.log(user.getId(), "ACCEPT_DONATION", "DONATION", donationId, null, "Reserved by " + beneficiaryOrg.getName());

        return toDto(saved, null, null);
    }

    @Transactional
    public DonationDto markReadyForPickup(UUID donationId, UUID supplierUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        if (donation.getStatus() != DonationStatus.RESERVED) {
            throw new BadRequestException("Donation cannot be marked ready in status: " + donation.getStatus());
        }

        User user = userRepository.findById(supplierUserId).orElseThrow();
        donation.setStatus(DonationStatus.READY_FOR_PICKUP);

        Pickup pickup = pickupRepository.findByDonationId(donationId)
                .orElseGet(() -> pickupRepository.save(new Pickup(donation, donation.getAcceptance())));
        pickup.setReadyAt(Instant.now());
        pickupRepository.save(pickup);

        Donation saved = donationRepository.save(donation);

        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                DonationStatus.RESERVED.name(),
                DonationStatus.READY_FOR_PICKUP.name(),
                user,
                "Supplier confirmed food packaged and ready for collection"
        ));

        // Notify Beneficiary
        if (donation.getAcceptance() != null) {
            organizationMemberRepository.findByOrganization(donation.getAcceptance().getBeneficiary()).forEach(bm -> {
                InAppNotification notif = new InAppNotification(
                        bm.getUser(),
                        "Food Ready for Pickup!",
                        donation.getSupplier().getName() + " has prepared your reserved food (" + donation.getTitle() + "). You may begin collection.",
                        "READY_FOR_PICKUP",
                        "/beneficiary/pickups"
                );
                notificationRepository.save(notif);
            });
        }

        return toDto(saved, null, null);
    }

    @Transactional
    public DonationDto approveDonationRequest(UUID donationId, UUID supplierUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + supplierUserId));

        OrganizationMember supplierMember = organizationMemberRepository.findByUser(supplierUser)
                .orElseThrow(() -> new BadRequestException("User does not belong to any supplier organization."));

        if (!donation.getSupplier().getId().equals(supplierMember.getOrganization().getId())) {
            throw new ForbiddenException("You are not authorized to approve requests for this donation.");
        }

        DonationAcceptance acceptance = donation.getAcceptance();
        if (acceptance == null) {
            throw new BadRequestException("No collection request found for this donation.");
        }

        acceptance.setStatus("APPROVED");
        acceptanceRepository.save(acceptance);

        donation.setStatus(DonationStatus.READY_FOR_PICKUP);

        // Generate Secure 6-Digit OTP (15 minute expiration)
        String rawOtp = otpSecurityUtil.generateSixDigitOtp();
        String otpHash = passwordEncoder.encode(rawOtp);
        String encryptedOtp = otpSecurityUtil.encryptOtp(rawOtp);

        Pickup pickup = pickupRepository.findByDonationId(donationId)
                .orElseGet(() -> new Pickup(donation, acceptance));
        pickup.setReadyAt(Instant.now());
        pickup.setOtpHash(otpHash);
        pickup.setEncryptedOtp(encryptedOtp);
        pickup.setOtpExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
        pickup.setOtpAttempts(0);
        pickup.setOtpUsed(false);
        pickup.setOtpVerifiedAt(null);
        pickupRepository.save(pickup);

        Donation saved = donationRepository.save(donation);

        // Status history
        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                DonationStatus.RESERVED.name(),
                DonationStatus.READY_FOR_PICKUP.name(),
                supplierUser,
                "Request approved by supplier. Secure pickup OTP generated."
        ));

        // Notify Beneficiary via in-app notification & Email
        Organization beneficiaryOrg = acceptance.getBeneficiary();
        organizationMemberRepository.findByOrganization(beneficiaryOrg).forEach(bm -> {
            InAppNotification notif = new InAppNotification(
                    bm.getUser(),
                    "Food Request Approved!",
                    donation.getSupplier().getName() + " approved your request for " + donation.getTitle() + ". Your pickup OTP has been generated.",
                    "REQUEST_APPROVED",
                    "/beneficiary/pickups"
            );
            notificationRepository.save(notif);

            emailService.sendPickupApprovedEmail(
                    bm.getUser().getEmail(),
                    bm.getUser().getUserProfile() != null ? bm.getUser().getUserProfile().getFullName() : beneficiaryOrg.getName(),
                    donation.getTitle(),
                    rawOtp
            );
        });

        auditService.log(supplierUserId, "APPROVE_DONATION_REQUEST", "DONATION", donationId, null, "Approved request for " + beneficiaryOrg.getName());

        return toDto(saved, null, null);
    }

    @Transactional
    public DonationDto rejectDonationRequest(UUID donationId, UUID supplierUserId, String reason) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + supplierUserId));

        OrganizationMember supplierMember = organizationMemberRepository.findByUser(supplierUser)
                .orElseThrow(() -> new BadRequestException("User does not belong to any supplier organization."));

        if (!donation.getSupplier().getId().equals(supplierMember.getOrganization().getId())) {
            throw new ForbiddenException("You are not authorized to reject requests for this donation.");
        }

        DonationAcceptance acceptance = donation.getAcceptance();
        if (acceptance != null) {
            acceptance.setStatus("REJECTED");
            acceptance.setRejectionReason(reason != null ? reason : "Supplier unable to fulfill request at this time.");
            acceptanceRepository.save(acceptance);
        }

        // Revert donation to AVAILABLE so others can request it
        DonationStatus prev = donation.getStatus();
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setAcceptance(null);
        Donation saved = donationRepository.save(donation);

        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                prev.name(),
                DonationStatus.AVAILABLE.name(),
                supplierUser,
                "Request rejected by supplier. Reason: " + (reason != null ? reason : "None provided")
        ));

        if (acceptance != null) {
            organizationMemberRepository.findByOrganization(acceptance.getBeneficiary()).forEach(bm -> {
                InAppNotification notif = new InAppNotification(
                        bm.getUser(),
                        "Donation Request Declined",
                        donation.getSupplier().getName() + " was unable to approve your request for " + donation.getTitle() + ".",
                        "REQUEST_REJECTED",
                        "/beneficiary/find-food"
                );
                notificationRepository.save(notif);
            });
        }

        return toDto(saved, null, null);
    }

    @Transactional
    public Map<String, Object> getPickupOtp(UUID donationId, UUID beneficiaryUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        User beneficiaryUser = userRepository.findById(beneficiaryUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + beneficiaryUserId));

        OrganizationMember member = organizationMemberRepository.findByUser(beneficiaryUser)
                .orElseThrow(() -> new BadRequestException("User does not belong to any beneficiary organization."));

        DonationAcceptance acceptance = donation.getAcceptance();
        if (acceptance == null || !acceptance.getBeneficiary().getId().equals(member.getOrganization().getId())) {
            throw new ForbiddenException("Only the authorized beneficiary organization can view the pickup OTP.");
        }

        // 1. If donation is already collected / completed
        Pickup existingPickup = pickupRepository.findByDonationId(donationId).orElse(null);
        if (donation.getStatus() == DonationStatus.COMPLETED || donation.getStatus() == DonationStatus.COLLECTED
                || "COLLECTED".equalsIgnoreCase(acceptance.getStatus())
                || (existingPickup != null && existingPickup.isOtpUsed())) {
            Map<String, Object> result = new HashMap<>();
            result.put("donationId", donationId);
            result.put("status", "COLLECTED");
            result.put("collected", true);
            result.put("otp", null);
            result.put("isExpired", false);
            result.put("message", "Successfully Collected");
            return result;
        }

        // Auto-synchronize acceptance status if donation is already ready for pickup, reserved, or in progress
        if ((donation.getStatus() == DonationStatus.READY_FOR_PICKUP || donation.getStatus() == DonationStatus.RESERVED || donation.getStatus() == DonationStatus.PICKUP_IN_PROGRESS)
                && !"APPROVED".equalsIgnoreCase(acceptance.getStatus())) {
            acceptance.setStatus("APPROVED");
            acceptanceRepository.save(acceptance);
        }

        // 2. If request is still PENDING supplier approval
        if ("PENDING".equalsIgnoreCase(acceptance.getStatus()) && donation.getStatus() == DonationStatus.AVAILABLE) {
            Map<String, Object> result = new HashMap<>();
            result.put("donationId", donationId);
            result.put("status", "PENDING");
            result.put("collected", false);
            result.put("otp", null);
            result.put("isExpired", false);
            result.put("message", "Your request is pending review by the food supplier. Once approved, your 6-digit pickup OTP will appear here.");
            return result;
        }

        // 3. For APPROVED or RESERVED pickups: ensure pickup record and active OTP exist
        Pickup pickup = existingPickup != null ? existingPickup : new Pickup(donation, acceptance);
        boolean isExpired = pickup.getOtpExpiresAt() == null || Instant.now().isAfter(pickup.getOtpExpiresAt());

        // If OTP does not exist or has expired, auto-regenerate a fresh active 15-minute OTP so beneficiary always has an active code
        if (pickup.getEncryptedOtp() == null || pickup.getEncryptedOtp().trim().isEmpty() || isExpired) {
            String rawOtp = otpSecurityUtil.generateSixDigitOtp();
            pickup.setOtpHash(passwordEncoder.encode(rawOtp));
            pickup.setEncryptedOtp(otpSecurityUtil.encryptOtp(rawOtp));
            pickup.setOtpExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
            pickup.setOtpAttempts(0);
            pickup.setOtpUsed(false);
            if (pickup.getReadyAt() == null) {
                pickup.setReadyAt(Instant.now());
            }
            pickup = pickupRepository.save(pickup);

            if (!"APPROVED".equalsIgnoreCase(acceptance.getStatus())) {
                acceptance.setStatus("APPROVED");
                acceptanceRepository.save(acceptance);
            }
            isExpired = false;
        }

        String decryptedOtp = otpSecurityUtil.decryptOtp(pickup.getEncryptedOtp());
        long secondsRemaining = Math.max(0, ChronoUnit.SECONDS.between(Instant.now(), pickup.getOtpExpiresAt()));

        Map<String, Object> result = new HashMap<>();
        result.put("donationId", donationId);
        result.put("otp", decryptedOtp);
        result.put("isExpired", false);
        result.put("expiresAt", pickup.getOtpExpiresAt());
        result.put("secondsRemaining", secondsRemaining);
        result.put("status", acceptance.getStatus());
        result.put("collected", false);
        result.put("verified", pickup.getOtpVerifiedAt() != null);
        result.put("attemptsRemaining", Math.max(0, 5 - pickup.getOtpAttempts()));

        return result;
    }

    @Transactional
    public Map<String, Object> regeneratePickupOtp(UUID donationId, UUID beneficiaryUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        User beneficiaryUser = userRepository.findById(beneficiaryUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + beneficiaryUserId));

        OrganizationMember member = organizationMemberRepository.findByUser(beneficiaryUser)
                .orElseThrow(() -> new BadRequestException("User does not belong to any beneficiary organization."));

        DonationAcceptance acceptance = donation.getAcceptance();
        if (acceptance == null || !acceptance.getBeneficiary().getId().equals(member.getOrganization().getId())) {
            throw new ForbiddenException("Only the authorized beneficiary organization can regenerate the pickup OTP.");
        }

        if (!"APPROVED".equalsIgnoreCase(acceptance.getStatus())
                && donation.getStatus() != DonationStatus.READY_FOR_PICKUP
                && donation.getStatus() != DonationStatus.RESERVED
                && donation.getStatus() != DonationStatus.PICKUP_IN_PROGRESS) {
            throw new BadRequestException("Cannot regenerate OTP for an unapproved request.");
        }

        Pickup pickup = pickupRepository.findByDonationId(donationId)
                .orElseGet(() -> pickupRepository.save(new Pickup(donation, acceptance)));

        if (pickup.isOtpUsed()) {
            throw new BadRequestException("Food collection is already complete. OTP cannot be regenerated.");
        }

        if (!"APPROVED".equalsIgnoreCase(acceptance.getStatus())) {
            acceptance.setStatus("APPROVED");
            acceptanceRepository.save(acceptance);
        }

        // Generate new random 6-digit OTP, invalidate previous
        String newOtp = otpSecurityUtil.generateSixDigitOtp();
        pickup.setOtpHash(passwordEncoder.encode(newOtp));
        pickup.setEncryptedOtp(otpSecurityUtil.encryptOtp(newOtp));
        pickup.setOtpExpiresAt(Instant.now().plus(15, ChronoUnit.MINUTES));
        pickup.setOtpAttempts(0);
        pickup.setOtpVerifiedAt(null);
        pickupRepository.save(pickup);

        auditService.log(beneficiaryUserId, "REGENERATE_PICKUP_OTP", "DONATION", donationId, null, "Regenerated OTP for pickup");

        Map<String, Object> result = new HashMap<>();
        result.put("donationId", donationId);
        result.put("otp", newOtp);
        result.put("isExpired", false);
        result.put("expiresAt", pickup.getOtpExpiresAt());
        result.put("secondsRemaining", 900);
        result.put("message", "New Pickup OTP generated successfully. Valid for 15 minutes.");

        return result;
    }

    @Transactional
    public Map<String, Object> verifyPickupOtp(UUID donationId, UUID supplierUserId, String enteredOtp, Integer confirmedServings) {
        if (donationId == null) {
            throw new BadRequestException("Reservation Not Found: Donation ID is missing.");
        }

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation Not Found: Food donation not found with ID " + donationId));

        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + supplierUserId));

        OrganizationMember supplierMember = organizationMemberRepository.findByUser(supplierUser).orElse(null);

        boolean isOwner = false;
        if (donation.getSupplier() != null && supplierMember != null && supplierMember.getOrganization() != null) {
            isOwner = donation.getSupplier().getId().equals(supplierMember.getOrganization().getId());
        }
        if (!isOwner && donation.getCreatedByUser() != null) {
            isOwner = donation.getCreatedByUser().getId().equals(supplierUserId);
        }
        boolean isAdmin = supplierUser.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Unauthorized Supplier: You do not own this food donation.");
        }

        DonationAcceptance acceptance = donation.getAcceptance();
        if (acceptance == null) {
            throw new BadRequestException("Reservation Not Found: No beneficiary collection request found for this donation.");
        }

        Pickup pickup = pickupRepository.findByDonationId(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation Not Found: Pickup record not found for donation: " + donationId));

        if (pickup.isOtpUsed() || donation.getStatus() == DonationStatus.COMPLETED || donation.getStatus() == DonationStatus.COLLECTED || "COLLECTED".equalsIgnoreCase(acceptance.getStatus())) {
            throw new BadRequestException("OTP Already Used: This food handover has already been completed.");
        }

        if (!"APPROVED".equalsIgnoreCase(acceptance.getStatus()) && !"RESERVED".equalsIgnoreCase(acceptance.getStatus()) && donation.getStatus() != DonationStatus.READY_FOR_PICKUP) {
            throw new BadRequestException("Verification Failed – Please Try Again: This reservation is not currently approved for pickup.");
        }

        if (pickup.getOtpExpiresAt() == null || Instant.now().isAfter(pickup.getOtpExpiresAt())) {
            throw new BadRequestException("OTP Expired: The Pickup OTP has expired. Please ask the beneficiary to click 'Regenerate OTP' in their dashboard.");
        }

        if (pickup.getOtpAttempts() >= 5) {
            throw new BadRequestException("Verification Failed – Please Try Again: Maximum OTP verification attempts exceeded (5/5). Please ask the beneficiary to regenerate the OTP.");
        }

        if (enteredOtp == null || enteredOtp.trim().isEmpty()) {
            throw new BadRequestException("Invalid OTP: Please enter the 6-digit Pickup OTP.");
        }

        String trimmedOtp = enteredOtp.trim();
        if (!trimmedOtp.matches("^\\d{6}$")) {
            throw new BadRequestException("Invalid OTP: Pickup OTP must be exactly 6 digits.");
        }

        boolean matches = passwordEncoder.matches(trimmedOtp, pickup.getOtpHash());
        if (!matches && pickup.getEncryptedOtp() != null) {
            String decrypted = otpSecurityUtil.decryptOtp(pickup.getEncryptedOtp());
            if (trimmedOtp.equals(decrypted)) {
                matches = true;
            }
        }

        if (!matches) {
            int newAttempts = pickup.getOtpAttempts() + 1;
            pickup.setOtpAttempts(newAttempts);
            pickupRepository.save(pickup);
            if (newAttempts >= 5) {
                throw new BadRequestException("Verification Failed – Please Try Again: Maximum OTP verification attempts exceeded (5/5). Please ask the beneficiary to regenerate the OTP.");
            }
            int remaining = Math.max(0, 5 - newAttempts);
            throw new BadRequestException("Invalid OTP: Incorrect code entered. " + remaining + " attempts remaining.");
        }

        // OTP matches! Successfully complete the food handover and update pickup status
        Instant now = Instant.now();
        pickup.setOtpVerifiedAt(now);
        pickup.setOtpUsed(true);
        pickup.setHandoverConfirmedBySupplier(true);
        pickup.setCollectedAt(now);
        pickup.setCompletedAt(now);
        pickup.setHandoverConfirmedAt(now);
        if (confirmedServings != null && confirmedServings > 0) {
            pickup.setConfirmedServings(confirmedServings);
        } else {
            pickup.setConfirmedServings(donation.getEstimatedServings());
        }
        pickupRepository.save(pickup);

        acceptance.setStatus("COLLECTED");
        acceptanceRepository.save(acceptance);

        DonationStatus prevStatus = donation.getStatus();
        donation.setStatus(DonationStatus.COMPLETED);
        Donation saved = donationRepository.save(donation);

        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                prevStatus.name(),
                DonationStatus.COMPLETED.name(),
                supplierUser,
                "Food handover successfully verified via 6-digit Pickup OTP. Completed " + pickup.getConfirmedServings() + " meals."
        ));

        auditService.log(supplierUserId, "VERIFY_PICKUP_OTP", "DONATION", donationId, null, "Food handover verified via 6-digit OTP and marked completed");

        // Notify Beneficiary organization members
        if (acceptance.getBeneficiary() != null) {
            organizationMemberRepository.findByOrganization(acceptance.getBeneficiary()).forEach(bm -> {
                InAppNotification notif = new InAppNotification(
                        bm.getUser(),
                        "Food Handover Confirmed!",
                        "Food handover confirmed by " + (donation.getSupplier() != null ? donation.getSupplier().getName() : "Food Supplier") + ". Thank you for your partnership!",
                        "DONATION_COMPLETED",
                        "/beneficiary/pickups"
                );
                notificationRepository.save(notif);

                if (bm.getUser().getEmail() != null) {
                    emailService.sendHandoverCompleteEmail(
                            bm.getUser().getEmail(),
                            bm.getUser().getUserProfile() != null ? bm.getUser().getUserProfile().getFullName() : acceptance.getBeneficiary().getName(),
                            donation.getTitle(),
                            pickup.getConfirmedServings()
                    );
                }
            });
        }

        Map<String, Object> response = new HashMap<>();
        response.put("verified", true);
        response.put("completed", true);
        response.put("status", "COMPLETED");
        response.put("message", "Pickup OTP Verified & Food Handover Completed Successfully!");
        response.put("verifiedAt", now);
        response.put("completedAt", now);
        response.put("confirmedServings", pickup.getConfirmedServings());
        response.put("beneficiaryName", acceptance.getBeneficiary() != null ? acceptance.getBeneficiary().getName() : "Beneficiary");
        return response;
    }

    @Transactional
    public Map<String, Object> verifyPickupOtp(UUID donationId, UUID supplierUserId, String enteredOtp) {
        return verifyPickupOtp(donationId, supplierUserId, enteredOtp, null);
    }

    @Transactional
    public DonationDto confirmFoodHandover(UUID donationId, UUID supplierUserId, Integer confirmedServings) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation Not Found: Food donation not found: " + donationId));

        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + supplierUserId));

        OrganizationMember supplierMember = organizationMemberRepository.findByUser(supplierUser).orElse(null);

        boolean isOwner = false;
        if (donation.getSupplier() != null && supplierMember != null && supplierMember.getOrganization() != null) {
            isOwner = donation.getSupplier().getId().equals(supplierMember.getOrganization().getId());
        }
        if (!isOwner && donation.getCreatedByUser() != null) {
            isOwner = donation.getCreatedByUser().getId().equals(supplierUserId);
        }
        boolean isAdmin = supplierUser.getRoles().stream().anyMatch(r -> "ROLE_ADMIN".equals(r.getName()));

        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Unauthorized Supplier: You do not own this food donation.");
        }

        Pickup pickup = pickupRepository.findByDonationId(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation Not Found: Pickup record not found for donation: " + donationId));

        if (pickup.isOtpUsed() && donation.getStatus() == DonationStatus.COMPLETED) {
            if (confirmedServings != null && confirmedServings > 0) {
                pickup.setConfirmedServings(confirmedServings);
                pickupRepository.save(pickup);
            }
            return toDto(donation, null, null);
        }

        if (pickup.getOtpVerifiedAt() == null) {
            throw new BadRequestException("Verification Failed – Please Try Again: You must verify the beneficiary's Pickup OTP before confirming food handover.");
        }

        Instant now = Instant.now();
        pickup.setOtpUsed(true);
        pickup.setHandoverConfirmedBySupplier(true);
        pickup.setCollectedAt(now);
        pickup.setCompletedAt(now);
        pickup.setHandoverConfirmedAt(now);
        if (confirmedServings != null && confirmedServings > 0) {
            pickup.setConfirmedServings(confirmedServings);
        } else {
            pickup.setConfirmedServings(donation.getEstimatedServings());
        }
        pickupRepository.save(pickup);

        DonationAcceptance acceptance = donation.getAcceptance();
        if (acceptance != null) {
            acceptance.setStatus("COLLECTED");
            acceptanceRepository.save(acceptance);
        }

        DonationStatus prevStatus = donation.getStatus();
        donation.setStatus(DonationStatus.COMPLETED);
        Donation saved = donationRepository.save(donation);

        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                prevStatus.name(),
                DonationStatus.COMPLETED.name(),
                supplierUser,
                "Food handover physically confirmed. OTP marked as used. Completed " + pickup.getConfirmedServings() + " meals."
        ));

        // Notify Beneficiary
        if (acceptance != null && acceptance.getBeneficiary() != null) {
            organizationMemberRepository.findByOrganization(acceptance.getBeneficiary()).forEach(bm -> {
                InAppNotification notif = new InAppNotification(
                        bm.getUser(),
                        "Food Handover Confirmed!",
                        "Food handover confirmed by " + (donation.getSupplier() != null ? donation.getSupplier().getName() : "Food Supplier") + ". Thank you for your partnership!",
                        "DONATION_COMPLETED",
                        "/beneficiary/pickups"
                );
                notificationRepository.save(notif);

                if (bm.getUser().getEmail() != null) {
                    emailService.sendHandoverCompleteEmail(
                            bm.getUser().getEmail(),
                            bm.getUser().getUserProfile() != null ? bm.getUser().getUserProfile().getFullName() : acceptance.getBeneficiary().getName(),
                            donation.getTitle(),
                            pickup.getConfirmedServings()
                    );
                }
            });
        }

        auditService.log(supplierUserId, "CONFIRM_FOOD_HANDOVER", "DONATION", donationId, null, "Confirmed handover of " + pickup.getConfirmedServings() + " meals");

        return toDto(saved, null, null);
    }

    @Transactional
    public DonationDto startPickup(UUID donationId, UUID beneficiaryUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        if (donation.getStatus() != DonationStatus.READY_FOR_PICKUP && donation.getStatus() != DonationStatus.RESERVED) {
            throw new BadRequestException("Invalid state transition to PICKUP_IN_PROGRESS from: " + donation.getStatus());
        }

        User user = userRepository.findById(beneficiaryUserId).orElseThrow();
        DonationStatus prev = donation.getStatus();
        donation.setStatus(DonationStatus.PICKUP_IN_PROGRESS);

        Pickup pickup = pickupRepository.findByDonationId(donationId).orElseThrow();
        pickup.setPickupStartedAt(Instant.now());
        pickupRepository.save(pickup);

        Donation saved = donationRepository.save(donation);

        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                prev.name(),
                DonationStatus.PICKUP_IN_PROGRESS.name(),
                user,
                "Beneficiary is traveling to supplier location"
        ));

        // Notify Supplier
        organizationMemberRepository.findByOrganization(donation.getSupplier()).forEach(sm -> {
            InAppNotification notif = new InAppNotification(
                    sm.getUser(),
                    "Pickup In Progress",
                    donation.getAcceptance().getBeneficiary().getName() + " is currently in transit to pick up the food.",
                    "PICKUP_STARTED",
                    "/supplier/donations"
            );
            notificationRepository.save(notif);
        });

        return toDto(saved, null, null);
    }

    @Transactional
    public DonationDto markCollected(UUID donationId, UUID beneficiaryUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        if (donation.getStatus() != DonationStatus.PICKUP_IN_PROGRESS) {
            throw new BadRequestException("Donation cannot be marked collected in status: " + donation.getStatus());
        }

        User user = userRepository.findById(beneficiaryUserId).orElseThrow();
        donation.setStatus(DonationStatus.COLLECTED);

        Pickup pickup = pickupRepository.findByDonationId(donationId).orElseThrow();
        pickup.setCollectedAt(Instant.now());
        pickupRepository.save(pickup);

        Donation saved = donationRepository.save(donation);

        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                DonationStatus.PICKUP_IN_PROGRESS.name(),
                DonationStatus.COLLECTED.name(),
                user,
                "Food physically collected by beneficiary representative"
        ));

        // Notify Supplier to confirm handover
        organizationMemberRepository.findByOrganization(donation.getSupplier()).forEach(sm -> {
            InAppNotification notif = new InAppNotification(
                    sm.getUser(),
                    "Food Handover Complete",
                    "Beneficiary marked the food as collected. Please confirm completion to finalize impact records.",
                    "FOOD_COLLECTED",
                    "/supplier/donations"
            );
            notificationRepository.save(notif);
        });

        return toDto(saved, null, null);
    }

    @Transactional
    public DonationDto completeDonation(UUID donationId, UUID supplierUserId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        if (donation.getStatus() != DonationStatus.COLLECTED && donation.getStatus() != DonationStatus.PICKUP_IN_PROGRESS) {
            throw new BadRequestException("Donation cannot be completed in status: " + donation.getStatus());
        }

        User user = userRepository.findById(supplierUserId).orElseThrow();
        DonationStatus prev = donation.getStatus();
        donation.setStatus(DonationStatus.COMPLETED);

        Pickup pickup = pickupRepository.findByDonationId(donationId).orElseThrow();
        pickup.setCompletedAt(Instant.now());
        pickup.setHandoverConfirmedBySupplier(true);
        pickupRepository.save(pickup);

        Donation saved = donationRepository.save(donation);

        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                prev.name(),
                DonationStatus.COMPLETED.name(),
                user,
                "Handover confirmed by supplier. Impact recorded."
        ));

        // Notify Beneficiary
        if (donation.getAcceptance() != null) {
            organizationMemberRepository.findByOrganization(donation.getAcceptance().getBeneficiary()).forEach(bm -> {
                InAppNotification notif = new InAppNotification(
                        bm.getUser(),
                        "Donation Completed!",
                        "Donation has been finalized. " + donation.getEstimatedServings() + " meals saved! Thank you.",
                        "DONATION_COMPLETED",
                        "/beneficiary/pickups"
                );
                notificationRepository.save(notif);
            });
        }

        auditService.log(user.getId(), "COMPLETE_DONATION", "DONATION", donationId, null, "Completed handover of " + donation.getEstimatedServings() + " meals");

        return toDto(saved, null, null);
    }

    @Transactional
    public DonationDto cancelDonation(UUID donationId, UUID userId, String reason) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        if (donation.getStatus() == DonationStatus.COMPLETED || donation.getStatus() == DonationStatus.CANCELLED) {
            throw new BadRequestException("Donation is already in final status: " + donation.getStatus());
        }

        User user = userRepository.findById(userId).orElseThrow();
        DonationStatus prev = donation.getStatus();
        donation.setStatus(DonationStatus.CANCELLED);
        Donation saved = donationRepository.save(donation);

        statusHistoryRepository.save(new DonationStatusHistory(
                saved,
                prev.name(),
                DonationStatus.CANCELLED.name(),
                user,
                "Cancelled. Reason: " + (reason != null ? reason : "Not specified")
        ));

        auditService.log(user.getId(), "CANCEL_DONATION", "DONATION", donationId, null, "Reason: " + reason);

        return toDto(saved, null, null);
    }

    @Transactional
    public DonationDto updateDonation(UUID donationId, UUID supplierUserId, UpdateDonationRequest request) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found: " + donationId));

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new BadRequestException("Only AVAILABLE donations can be edited. Current status: " + donation.getStatus());
        }

        if (request.getTitle() != null) donation.setTitle(request.getTitle());
        if (request.getDescription() != null) donation.setDescription(request.getDescription());
        if (request.getFoodCategory() != null) donation.setFoodCategory(request.getFoodCategory());
        if (request.getDietaryType() != null) donation.setDietaryType(request.getDietaryType());
        if (request.getEstimatedServings() != null) donation.setEstimatedServings(request.getEstimatedServings());
        if (request.getPickupAvailableUntil() != null) donation.setPickupAvailableUntil(request.getPickupAvailableUntil());
        if (request.getConsumeBeforeTime() != null) donation.setConsumeBeforeTime(request.getConsumeBeforeTime());
        if (request.getPackagingStatus() != null) donation.setPackagingStatus(request.getPackagingStatus());
        if (request.getAllergens() != null) donation.setAllergens(request.getAllergens());
        if (request.getSpecialInstructions() != null) donation.setSpecialInstructions(request.getSpecialInstructions());
        if (request.getPickupInstructions() != null) donation.setPickupInstructions(request.getPickupInstructions());

        Donation saved = donationRepository.save(donation);
        return toDto(saved, null, null);
    }

    public DonationDto toDto(Donation donation, BigDecimal userLat, BigDecimal userLon) {
        DonationDto dto = new DonationDto();
        dto.setId(donation.getId());
        dto.setSupplierId(donation.getSupplier().getId());
        dto.setSupplierName(donation.getSupplier().getName());
        dto.setSupplierLogoUrl(donation.getSupplier().getLogoUrl());
        String supPhone = (donation.getSupplier().getPublicPhone() != null && !donation.getSupplier().getPublicPhone().trim().isEmpty())
                ? donation.getSupplier().getPublicPhone().trim()
                : donation.getSupplier().getContactPhone();
        dto.setSupplierPhone(supPhone);

        if (donation.getSupplier().getAddress() != null) {
            Address sa = donation.getSupplier().getAddress();
            dto.setSupplierAddress(sa.getStreetAddress());
            dto.setSupplierLocality(sa.getAreaLocality());
            dto.setSupplierCity(sa.getCity());
            dto.setSupplierState(sa.getState());
            dto.setSupplierPostalCode(sa.getPostalCode());
            dto.setSupplierLatitude(sa.getLatitude() != null ? sa.getLatitude().doubleValue() : null);
            dto.setSupplierLongitude(sa.getLongitude() != null ? sa.getLongitude().doubleValue() : null);
        } else if (donation.getPickupAddress() != null) {
            Address pa = donation.getPickupAddress();
            dto.setSupplierAddress(pa.getStreetAddress());
            dto.setSupplierLocality(pa.getAreaLocality());
            dto.setSupplierCity(pa.getCity());
            dto.setSupplierState(pa.getState());
            dto.setSupplierPostalCode(pa.getPostalCode());
            dto.setSupplierLatitude(pa.getLatitude() != null ? pa.getLatitude().doubleValue() : null);
            dto.setSupplierLongitude(pa.getLongitude() != null ? pa.getLongitude().doubleValue() : null);
        }
        dto.setTitle(donation.getTitle());
        dto.setDescription(donation.getDescription());
        dto.setFoodCategory(donation.getFoodCategory());
        dto.setDietaryType(donation.getDietaryType());
        dto.setApproximateQuantity(donation.getApproximateQuantity());
        dto.setQuantityUnit(donation.getQuantityUnit());
        dto.setEstimatedServings(donation.getEstimatedServings());
        dto.setPreparationTime(donation.getPreparationTime());
        dto.setPickupAvailableFrom(donation.getPickupAvailableFrom());
        dto.setPickupAvailableUntil(donation.getPickupAvailableUntil());
        dto.setConsumeBeforeTime(donation.getConsumeBeforeTime());
        dto.setStatus(donation.getStatus());
        dto.setPackagingStatus(donation.getPackagingStatus());
        dto.setAllergens(donation.getAllergens());
        dto.setSpecialInstructions(donation.getSpecialInstructions());
        dto.setPickupInstructions(donation.getPickupInstructions());
        dto.setCreatedAt(donation.getCreatedAt());

        if (donation.getPickupAddress() != null) {
            Address a = donation.getPickupAddress();
            dto.setAddress(new DonationDto.AddressDto(
                    a.getStreetAddress(), a.getCity(), a.getState(), a.getPostalCode(), a.getLatitude(), a.getLongitude()
            ));

            if (userLat != null && userLon != null) {
                double dist = geospatialService.calculateDistanceKm(userLat, userLon, a.getLatitude(), a.getLongitude());
                dto.setDistanceKm(dist < Double.MAX_VALUE ? Math.round(dist * 10.0) / 10.0 : null);
            }
        }

        if (donation.getFoodItems() != null) {
            dto.setFoodItems(donation.getFoodItems().stream()
                    .map(item -> new DonationDto.FoodItemDto(item.getId(), item.getItemName(), item.getQuantity()))
                    .collect(Collectors.toList()));
        }

        if (donation.getImages() != null) {
            dto.setImages(donation.getImages().stream()
                    .map(img -> new DonationDto.ImageDto(img.getId(), img.getImageUrl(), img.isPrimary()))
                    .collect(Collectors.toList()));
        }

        if (donation.getAcceptance() != null) {
            dto.setAcceptedByBeneficiaryId(donation.getAcceptance().getBeneficiary().getId());
            dto.setAcceptedByBeneficiaryName(donation.getAcceptance().getBeneficiary().getName());
            dto.setAcceptedAt(donation.getAcceptance().getAcceptedAt());
            dto.setAcceptanceStatus(donation.getAcceptance().getStatus());
        }

        if (donation.getPickup() != null) {
            dto.setPickupReadyAt(donation.getPickup().getReadyAt());
            dto.setPickupStartedAt(donation.getPickup().getPickupStartedAt());
            dto.setPickupCollectedAt(donation.getPickup().getCollectedAt());
            dto.setCompletedAt(donation.getPickup().getCompletedAt());
            dto.setHandoverConfirmed(donation.getPickup().isHandoverConfirmedBySupplier());
            dto.setOtpVerified(donation.getPickup().getOtpVerifiedAt() != null);
            dto.setOtpExpiresAt(donation.getPickup().getOtpExpiresAt());
        }

        return dto;
    }
}
