package org.sharingfood.dto;

import java.time.Instant;
import java.util.UUID;

public class AdminVolunteerVerificationDto {
    private UUID profileId;
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String city;
    private String idProofType;
    private String idProofNumber;
    private String idProofDocumentUrl;
    private String profilePhotoUrl;
    private String serviceArea;
    private String interests;
    private String verificationStatus;
    private Instant createdAt;

    public AdminVolunteerVerificationDto() {}

    public String getServiceArea() {
        return serviceArea;
    }

    public void setServiceArea(String serviceArea) {
        this.serviceArea = serviceArea;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public UUID getProfileId() {
        return profileId;
    }

    public void setProfileId(UUID profileId) {
        this.profileId = profileId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getIdProofType() {
        return idProofType;
    }

    public void setIdProofType(String idProofType) {
        this.idProofType = idProofType;
    }

    public String getIdProofNumber() {
        return idProofNumber;
    }

    public void setIdProofNumber(String idProofNumber) {
        this.idProofNumber = idProofNumber;
    }

    public String getIdProofDocumentUrl() {
        return idProofDocumentUrl;
    }

    public void setIdProofDocumentUrl(String idProofDocumentUrl) {
        this.idProofDocumentUrl = idProofDocumentUrl;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
