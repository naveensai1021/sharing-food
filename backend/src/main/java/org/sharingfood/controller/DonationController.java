package org.sharingfood.controller;

import jakarta.validation.Valid;
import org.sharingfood.dto.CreateDonationRequest;
import org.sharingfood.dto.DonationDto;
import org.sharingfood.dto.UpdateDonationRequest;
import org.sharingfood.entity.DietaryType;
import org.sharingfood.entity.FoodCategory;
import org.sharingfood.security.UserPrincipal;
import org.sharingfood.service.DonationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<DonationDto> createDonation(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateDonationRequest request) {
        return ResponseEntity.ok(donationService.createDonation(currentUser.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<DonationDto>> getMyDonations(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_BENEFICIARY"))) {
            return ResponseEntity.ok(donationService.getDonationsForBeneficiary(currentUser.getId()));
        }
        return ResponseEntity.ok(donationService.getDonationsForSupplier(currentUser.getId()));
    }

    @GetMapping("/supplier/summary")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<org.sharingfood.dto.SupplierSummaryDto> getSupplierSummary(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.getSupplierSummary(currentUser.getId()));
    }

    @GetMapping("/beneficiary/summary")
    @PreAuthorize("hasRole('BENEFICIARY')")
    public ResponseEntity<org.sharingfood.dto.BeneficiarySummaryDto> getBeneficiarySummary(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.getBeneficiarySummary(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationDto> getDonation(
            @PathVariable UUID id,
            @RequestParam(required = false) BigDecimal lat,
            @RequestParam(required = false) BigDecimal lng) {
        return ResponseEntity.ok(donationService.getDonationDetails(id, lat, lng));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<DonationDto> updateDonation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody UpdateDonationRequest request) {
        return ResponseEntity.ok(donationService.updateDonation(id, currentUser.getId(), request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<DonationDto> cancelDonation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(donationService.cancelDonation(id, currentUser.getId(), reason));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<DonationDto>> getNearbyDonations(
            @RequestParam(defaultValue = "17.385044") BigDecimal lat,
            @RequestParam(defaultValue = "78.486671") BigDecimal lng,
            @RequestParam(defaultValue = "10.0") double radiusKm,
            @RequestParam(required = false) FoodCategory category,
            @RequestParam(required = false) DietaryType dietary) {
        return ResponseEntity.ok(donationService.getNearbyDonations(lat, lng, radiusKm, category, dietary));
    }

    /**
     * Section 19 & 21: Donation Acceptance with DB-Level Pessimistic Concurrency Lock.
     */
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('BENEFICIARY')")
    public ResponseEntity<DonationDto> acceptDonation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.acceptDonation(id, currentUser.getId()));
    }

    @PostMapping("/{id}/ready")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<DonationDto> markReady(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.markReadyForPickup(id, currentUser.getId()));
    }

    @PostMapping("/{id}/pickup/start")
    @PreAuthorize("hasRole('BENEFICIARY')")
    public ResponseEntity<DonationDto> startPickup(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.startPickup(id, currentUser.getId()));
    }

    @PostMapping("/{id}/pickup/collected")
    @PreAuthorize("hasRole('BENEFICIARY')")
    public ResponseEntity<DonationDto> markCollected(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.markCollected(id, currentUser.getId()));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    public ResponseEntity<DonationDto> approveRequest(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.approveDonationRequest(id, currentUser.getId()));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    public ResponseEntity<DonationDto> rejectRequest(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(donationService.rejectDonationRequest(id, currentUser.getId(), reason));
    }

    @GetMapping("/{id}/pickup-otp")
    @PreAuthorize("hasRole('BENEFICIARY')")
    public ResponseEntity<Map<String, Object>> getPickupOtp(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.getPickupOtp(id, currentUser.getId()));
    }

    @PostMapping("/{id}/regenerate-otp")
    @PreAuthorize("hasRole('BENEFICIARY')")
    public ResponseEntity<Map<String, Object>> regenerateOtp(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.regeneratePickupOtp(id, currentUser.getId()));
    }

    @PostMapping("/{id}/verify-otp")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, String> body) {
        String otp = body != null ? body.get("otp") : "";
        return ResponseEntity.ok(donationService.verifyPickupOtp(id, currentUser.getId(), otp));
    }

    @PostMapping("/{id}/confirm-handover")
    @PreAuthorize("hasAnyRole('SUPPLIER', 'ADMIN')")
    public ResponseEntity<DonationDto> confirmHandover(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody(required = false) Map<String, Integer> body) {
        Integer servings = body != null ? body.get("servings") : null;
        return ResponseEntity.ok(donationService.confirmFoodHandover(id, currentUser.getId(), servings));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<DonationDto> completeDonation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.completeDonation(id, currentUser.getId()));
    }
}
