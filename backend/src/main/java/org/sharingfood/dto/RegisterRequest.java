package org.sharingfood.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Role is required (SUPPLIER, BENEFICIARY, VOLUNTEER)")
    private String role; // SUPPLIER, BENEFICIARY, VOLUNTEER

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String city;

    // Organization Fields (For Supplier & Beneficiary)
    private String organizationName;
    private String organizationType;
    private String description;
    private String logoUrl;
    private String photoUrl; // Storefront (Supplier) or Building/Premises (Beneficiary)
    private String streetAddress;
    private String locality; // Area / Locality
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String publicPhone; // Approved public contact phone
    private Boolean showPublicPhone;

    // Beneficiary specific fields
    private Integer residentCount;
    private Integer foodCapacityServings;
    private String dietaryPreferences;

    // Section 53: Volunteer Attribution field
    // Optional field: "Volunteer ID / Referred by Volunteer"
    private String volunteerIdCode;

    // Volunteer specific fields
    private String profilePhotoUrl;
    private String idProofUrl;
    private String serviceArea;
    private String interests;

    public RegisterRequest() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public Integer getResidentCount() {
        return residentCount;
    }

    public void setResidentCount(Integer residentCount) {
        this.residentCount = residentCount;
    }

    public Integer getFoodCapacityServings() {
        return foodCapacityServings;
    }

    public void setFoodCapacityServings(Integer foodCapacityServings) {
        this.foodCapacityServings = foodCapacityServings;
    }

    public String getDietaryPreferences() {
        return dietaryPreferences;
    }

    public void setDietaryPreferences(String dietaryPreferences) {
        this.dietaryPreferences = dietaryPreferences;
    }

    public String getVolunteerIdCode() {
        return volunteerIdCode;
    }

    public void setVolunteerIdCode(String volunteerIdCode) {
        this.volunteerIdCode = volunteerIdCode;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getIdProofUrl() {
        return idProofUrl;
    }

    public void setIdProofUrl(String idProofUrl) {
        this.idProofUrl = idProofUrl;
    }

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

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getLocality() {
        return locality;
    }

    public void setLocality(String locality) {
        this.locality = locality;
    }

    public String getPublicPhone() {
        return publicPhone;
    }

    public void setPublicPhone(String publicPhone) {
        this.publicPhone = publicPhone;
    }

    public Boolean getShowPublicPhone() {
        return showPublicPhone;
    }

    public void setShowPublicPhone(Boolean showPublicPhone) {
        this.showPublicPhone = showPublicPhone;
    }
}
