package org.sharingfood.dto;

import java.time.Instant;
import java.util.UUID;

public class VolunteerLeadDto {
    private UUID id;
    private String organizationName;
    private String organizationType;
    private String contactName;
    private String phone;
    private String email;
    private String address;
    private String city;
    private String status;
    private String notes;
    private Instant createdAt;

    public VolunteerLeadDto() {}

    public VolunteerLeadDto(UUID id, String organizationName, String organizationType, String contactName, String phone, String email, String address, String city, String status, String notes, Instant createdAt) {
        this.id = id;
        this.organizationName = organizationName;
        this.organizationType = organizationType;
        this.contactName = contactName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.city = city;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
