package org.sharingfood.dto;

public class VoiceCallStartRequest {
    private String email;
    private String phone;
    private String language;

    public VoiceCallStartRequest() {}

    public VoiceCallStartRequest(String email, String phone, String language) {
        this.email = email;
        this.phone = phone;
        this.language = language;
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
