package org.sharingfood.dto;

public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String city;
    private String organizationName;
    private String description;
    private String logoUrl;
    private String publicPhone;
    private Boolean showPublicPhone;
    private String photoUrl;
    private String streetAddress;
    private String locality;
    private String state;
    private String postalCode;
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private String contactPerson;

    public UpdateProfileRequest() {}

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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
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

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public java.math.BigDecimal getLatitude() { return latitude; }
    public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }

    public java.math.BigDecimal getLongitude() { return longitude; }
    public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
}
