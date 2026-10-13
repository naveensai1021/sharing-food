package org.sharingfood.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "registration_otp_challenges")
public class RegistrationOtpChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_contact", nullable = false)
    private String targetContact;

    @Column(name = "verification_method", nullable = false, length = 20)
    private String verificationMethod;

    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    @Column(name = "max_attempts", nullable = false)
    private int maxAttempts = 5;

    @Column(name = "resend_available_at", nullable = false)
    private Instant resendAvailableAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "provider_call_id", length = 255)
    private String providerCallId;

    @Column(name = "call_status", length = 50)
    private String callStatus = "PENDING";

    @Column(name = "verification_result", length = 50)
    private String verificationResult = "PENDING";

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "dtmf_digit", length = 10)
    private String dtmfDigit;

    @Column(name = "disputed_at")
    private Instant disputedAt;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public RegistrationOtpChallenge() {}

    public RegistrationOtpChallenge(User user, String targetContact, String verificationMethod, String otpHash, Instant expiresAt, Instant resendAvailableAt, String ipAddress) {
        this.user = user;
        this.targetContact = targetContact;
        this.verificationMethod = verificationMethod;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
        this.resendAvailableAt = resendAvailableAt;
        this.ipAddress = ipAddress;
        this.attemptCount = 0;
        this.maxAttempts = 5;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTargetContact() {
        return targetContact;
    }

    public void setTargetContact(String targetContact) {
        this.targetContact = targetContact;
    }

    public String getVerificationMethod() {
        return verificationMethod;
    }

    public void setVerificationMethod(String verificationMethod) {
        this.verificationMethod = verificationMethod;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(int attemptCount) {
        this.attemptCount = attemptCount;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public Instant getResendAvailableAt() {
        return resendAvailableAt;
    }

    public void setResendAvailableAt(Instant resendAvailableAt) {
        this.resendAvailableAt = resendAvailableAt;
    }

    public Instant getConsumedAt() {
        return consumedAt;
    }

    public void setConsumedAt(Instant consumedAt) {
        this.consumedAt = consumedAt;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getProviderCallId() {
        return providerCallId;
    }

    public void setProviderCallId(String providerCallId) {
        this.providerCallId = providerCallId;
    }

    public String getCallStatus() {
        return callStatus;
    }

    public void setCallStatus(String callStatus) {
        this.callStatus = callStatus;
    }

    public String getVerificationResult() {
        return verificationResult;
    }

    public void setVerificationResult(String verificationResult) {
        this.verificationResult = verificationResult;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getDtmfDigit() {
        return dtmfDigit;
    }

    public void setDtmfDigit(String dtmfDigit) {
        this.dtmfDigit = dtmfDigit;
    }

    public Instant getDisputedAt() {
        return disputedAt;
    }

    public void setDisputedAt(Instant disputedAt) {
        this.disputedAt = disputedAt;
    }
}
