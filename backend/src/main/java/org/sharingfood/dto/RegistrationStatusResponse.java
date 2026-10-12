package org.sharingfood.dto;

import java.util.UUID;

public class RegistrationStatusResponse {

    private UUID userId;
    private String email;
    private String phone;
    private String status;
    private String verificationMethod;
    private boolean emailVerified;
    private boolean phoneVerified;
    private long cooldownRemainingSeconds;
    private long expiresInSeconds;
    private String message;

    public RegistrationStatusResponse() {}

    public RegistrationStatusResponse(UUID userId, String email, String phone, String status, String verificationMethod, boolean emailVerified, boolean phoneVerified, long cooldownRemainingSeconds, long expiresInSeconds, String message) {
        this.userId = userId;
        this.email = email;
        this.phone = phone;
        this.status = status;
        this.verificationMethod = verificationMethod;
        this.emailVerified = emailVerified;
        this.phoneVerified = phoneVerified;
        this.cooldownRemainingSeconds = cooldownRemainingSeconds;
        this.expiresInSeconds = expiresInSeconds;
        this.message = message;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getVerificationMethod() {
        return verificationMethod;
    }

    public void setVerificationMethod(String verificationMethod) {
        this.verificationMethod = verificationMethod;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public long getCooldownRemainingSeconds() {
        return cooldownRemainingSeconds;
    }

    public void setCooldownRemainingSeconds(long cooldownRemainingSeconds) {
        this.cooldownRemainingSeconds = cooldownRemainingSeconds;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
