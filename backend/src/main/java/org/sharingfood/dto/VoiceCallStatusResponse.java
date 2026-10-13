package org.sharingfood.dto;

import java.util.UUID;

public class VoiceCallStatusResponse {
    private UUID challengeId;
    private String callStatus;
    private String verificationResult;
    private String userStatus;
    private String phone;
    private int attemptCount;
    private int maxAttempts;
    private long cooldownSeconds;
    private long expiresInSeconds;
    private String message;

    public VoiceCallStatusResponse() {}

    public VoiceCallStatusResponse(
            UUID challengeId,
            String callStatus,
            String verificationResult,
            String userStatus,
            String phone,
            int attemptCount,
            int maxAttempts,
            long cooldownSeconds,
            long expiresInSeconds,
            String message
    ) {
        this.challengeId = challengeId;
        this.callStatus = callStatus;
        this.verificationResult = verificationResult;
        this.userStatus = userStatus;
        this.phone = phone;
        this.attemptCount = attemptCount;
        this.maxAttempts = maxAttempts;
        this.cooldownSeconds = cooldownSeconds;
        this.expiresInSeconds = expiresInSeconds;
        this.message = message;
    }

    public UUID getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(UUID challengeId) {
        this.challengeId = challengeId;
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

    public String getUserStatus() {
        return userStatus;
    }

    public void setUserStatus(String userStatus) {
        this.userStatus = userStatus;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public long getCooldownSeconds() {
        return cooldownSeconds;
    }

    public void setCooldownSeconds(long cooldownSeconds) {
        this.cooldownSeconds = cooldownSeconds;
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
