package org.sharingfood.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateVolunteerLeadRequest {

    @NotBlank(message = "Organization name is required")
    private String organizationName;

    @NotBlank(message = "Organization type is required (e.g. RESTAURANT, CATERER, OLD_AGE_HOME, ORPHANAGE)")
    private String organizationType;

    private String contactName;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String notes;

    public CreateVolunteerLeadRequest() {}

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationType() {
        return organizationType;
    }

    public void setOrganizationType(String organizationType) {
        this.organizationType = organizationType;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
