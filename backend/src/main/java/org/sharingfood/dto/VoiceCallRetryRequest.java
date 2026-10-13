package org.sharingfood.dto;

import java.util.UUID;

public class VoiceCallRetryRequest {
    private UUID challengeId;
    private String email;
    private String phone;
    private String language;

    public VoiceCallRetryRequest() {}

    public VoiceCallRetryRequest(UUID challengeId, String email, String phone, String language) {
        this.challengeId = challengeId;
        this.email = email;
        this.phone = phone;
        this.language = language;
    }

    public UUID getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(UUID challengeId) {
        this.challengeId = challengeId;
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

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}
