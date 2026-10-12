package org.sharingfood.dto;

public class VerifyEmailRequest {

    private String email;
    private String phone;
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

    // Support 'otp' as alias for 'code'
    public String getOtp() {
        return code;
    }

    public void setOtp(String otp) {
        if (otp != null && !otp.trim().isEmpty()) {
            this.code = otp.trim();
        }
    }
}
