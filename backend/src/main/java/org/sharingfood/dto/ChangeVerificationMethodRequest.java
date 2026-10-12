package org.sharingfood.dto;

import jakarta.validation.constraints.NotBlank;

public class ChangeVerificationMethodRequest {

    private String email;
    private String phone;

    @NotBlank(message = "New verification method is required ('EMAIL' or 'SMS')")
    private String newMethod;

    public ChangeVerificationMethodRequest() {}

    public ChangeVerificationMethodRequest(String email, String phone, String newMethod) {
        this.email = email;
        this.phone = phone;
        this.newMethod = newMethod;
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

    public String getNewMethod() {
        return newMethod;
    }

    public void setNewMethod(String newMethod) {
        this.newMethod = newMethod;
    }

    // Support 'method' alias
    public String getMethod() {
        return newMethod;
    }

    public void setMethod(String method) {
        if (method != null && !method.trim().isEmpty()) {
            this.newMethod = method.trim();
        }
    }
}
