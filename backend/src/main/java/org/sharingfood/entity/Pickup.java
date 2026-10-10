package org.sharingfood.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pickups")
public class Pickup {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", unique = true, nullable = false)
    @JsonIgnore
    private Donation donation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acceptance_id", unique = true, nullable = false)
    @JsonIgnore
    private DonationAcceptance acceptance;

    @Column(name = "ready_at")
    private Instant readyAt;

    @Column(name = "pickup_started_at")
    private Instant pickupStartedAt;

    @Column(name = "collected_at")
    private Instant collectedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "handover_confirmed_by_supplier", nullable = false)
    private boolean handoverConfirmedBySupplier = false;

    @Column(name = "otp_hash")
    private String otpHash;

    @Column(name = "encrypted_otp")
    private String encryptedOtp;

    @Column(name = "otp_expires_at")
    private Instant otpExpiresAt;

    @Column(name = "otp_attempts", nullable = false)
    private int otpAttempts = 0;

    @Column(name = "otp_used", nullable = false)
    private boolean otpUsed = false;

    @Column(name = "otp_verified_at")
    private Instant otpVerifiedAt;

    @Column(name = "confirmed_servings")
    private Integer confirmedServings;

    @Column(name = "handover_confirmed_at")
    private Instant handoverConfirmedAt;

    @Column(name = "pickup_notes", columnDefinition = "TEXT")
    private String pickupNotes;

    public Pickup() {}

    public Pickup(Donation donation, DonationAcceptance acceptance) {
        this.donation = donation;
        this.acceptance = acceptance;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Donation getDonation() {
        return donation;
    }

    public void setDonation(Donation donation) {
        this.donation = donation;
    }

    public DonationAcceptance getAcceptance() {
        return acceptance;
    }

    public void setAcceptance(DonationAcceptance acceptance) {
        this.acceptance = acceptance;
    }

    public Instant getReadyAt() {
        return readyAt;
    }

    public void setReadyAt(Instant readyAt) {
        this.readyAt = readyAt;
    }

    public Instant getPickupStartedAt() {
        return pickupStartedAt;
    }

    public void setPickupStartedAt(Instant pickupStartedAt) {
        this.pickupStartedAt = pickupStartedAt;
    }

    public Instant getCollectedAt() {
        return collectedAt;
    }

    public void setCollectedAt(Instant collectedAt) {
        this.collectedAt = collectedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public boolean isHandoverConfirmedBySupplier() {
        return handoverConfirmedBySupplier;
    }

    public void setHandoverConfirmedBySupplier(boolean handoverConfirmedBySupplier) {
        this.handoverConfirmedBySupplier = handoverConfirmedBySupplier;
    }

    public String getPickupNotes() {
        return pickupNotes;
    }

    public void setPickupNotes(String pickupNotes) {
        this.pickupNotes = pickupNotes;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public String getEncryptedOtp() {
        return encryptedOtp;
    }

    public void setEncryptedOtp(String encryptedOtp) {
        this.encryptedOtp = encryptedOtp;
    }

    public Instant getOtpExpiresAt() {
        return otpExpiresAt;
    }

    public void setOtpExpiresAt(Instant otpExpiresAt) {
        this.otpExpiresAt = otpExpiresAt;
    }

    public int getOtpAttempts() {
        return otpAttempts;
    }

    public void setOtpAttempts(int otpAttempts) {
        this.otpAttempts = otpAttempts;
    }

    public boolean isOtpUsed() {
        return otpUsed;
    }

    public void setOtpUsed(boolean otpUsed) {
        this.otpUsed = otpUsed;
    }

    public Instant getOtpVerifiedAt() {
        return otpVerifiedAt;
    }

    public void setOtpVerifiedAt(Instant otpVerifiedAt) {
        this.otpVerifiedAt = otpVerifiedAt;
    }

    public Integer getConfirmedServings() {
        return confirmedServings;
    }

    public void setConfirmedServings(Integer confirmedServings) {
        this.confirmedServings = confirmedServings;
    }

    public Instant getHandoverConfirmedAt() {
        return handoverConfirmedAt;
    }

    public void setHandoverConfirmedAt(Instant handoverConfirmedAt) {
        this.handoverConfirmedAt = handoverConfirmedAt;
    }
}
