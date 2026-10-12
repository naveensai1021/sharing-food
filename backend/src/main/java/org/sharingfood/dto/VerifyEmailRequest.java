package org.sharingfood.dto;

import jakarta.validation.constraints.NotBlank;

public class VerifyEmailRequest {

    private String email;
    private String phone;

    @NotBlank(message = "Verification code is required")
    private String code;

    public VerifyEmailRequest() {}

    public VerifyEmailRequest(String email, String code) {
        this.email = email;
        this.code = code;
    }

    public VerifyEmailRequest(String email, String phone, String code) {
        this.email = email;
        this.phone = phone;
        this.code = code;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
