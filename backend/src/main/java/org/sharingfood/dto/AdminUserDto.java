package org.sharingfood.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class AdminUserDto {
    private UUID id;
    private String email;
    private String role;
    private String status; // PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED
    private String statusReason;
    private UUID reviewedByAdminId;
    private Instant reviewedAt;
    private String fullName;
    private String phone;
    private String city;
    private Instant createdAt;
    private boolean emailVerified;
    private boolean phoneVerified;
    private String verificationMethod;

    // Organization Fields
    private UUID organizationId;
    private String organizationName;
    private String organizationType;
    private String organizationPhone;
    private String organizationEmail;
    private String photoUrl;
    private String logoUrl;
    private String licenseNumber;
    private String documentUrl;
    private String streetAddress;
    private String locality;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Beneficiary Details
    private Integer residentCount;
    private Integer foodCapacityServings;
    private String dietaryPreferences;

    public AdminUserDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatusReason() { return statusReason; }
    public void setStatusReason(String statusReason) { this.statusReason = statusReason; }

    public UUID getReviewedByAdminId() { return reviewedByAdminId; }
    public void setReviewedByAdminId(UUID reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public UUID getOrganizationId() { return organizationId; }
    public void setOrganizationId(UUID organizationId) { this.organizationId = organizationId; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getOrganizationType() { return organizationType; }
    public void setOrganizationType(String organizationType) { this.organizationType = organizationType; }

    public String getOrganizationPhone() { return organizationPhone; }
    public void setOrganizationPhone(String organizationPhone) { this.organizationPhone = organizationPhone; }

    public String getOrganizationEmail() { return organizationEmail; }
    public void setOrganizationEmail(String organizationEmail) { this.organizationEmail = organizationEmail; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public Integer getResidentCount() { return residentCount; }
    public void setResidentCount(Integer residentCount) { this.residentCount = residentCount; }

    public Integer getFoodCapacityServings() { return foodCapacityServings; }
    public void setFoodCapacityServings(Integer foodCapacityServings) { this.foodCapacityServings = foodCapacityServings; }

    public String getDietaryPreferences() { return dietaryPreferences; }
    public void setDietaryPreferences(String dietaryPreferences) { this.dietaryPreferences = dietaryPreferences; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public boolean isPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(boolean phoneVerified) { this.phoneVerified = phoneVerified; }

    public String getVerificationMethod() { return verificationMethod; }
    public void setVerificationMethod(String verificationMethod) { this.verificationMethod = verificationMethod; }
}
