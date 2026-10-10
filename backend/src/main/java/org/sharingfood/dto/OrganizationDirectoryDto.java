package org.sharingfood.dto;

import org.sharingfood.entity.OrganizationType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class OrganizationDirectoryDto {
    private UUID id;
    private String name;
    private OrganizationType type;
    private String description;
    private String logoUrl;
    private String photoUrl;
    private String city;
    private String locality;
    private String streetAddress;
    private String contactPhone;
    private String publicPhone;
    private boolean showContactPhone = true;
    private boolean showPublicPhone = true;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private long totalDonationsOrReceived;
    private long estimatedMealsSharedOrReceived;
    private Instant createdAt;

    public OrganizationDirectoryDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public OrganizationType getType() { return type; }
    public void setType(OrganizationType type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public long getTotalDonationsOrReceived() { return totalDonationsOrReceived; }
    public void setTotalDonationsOrReceived(long totalDonationsOrReceived) { this.totalDonationsOrReceived = totalDonationsOrReceived; }
    public long getEstimatedMealsSharedOrReceived() { return estimatedMealsSharedOrReceived; }
    public void setEstimatedMealsSharedOrReceived(long estimatedMealsSharedOrReceived) { this.estimatedMealsSharedOrReceived = estimatedMealsSharedOrReceived; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }
    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }

    public String getContactPhone() { 
        return contactPhone != null ? contactPhone : publicPhone; 
    }
    public void setContactPhone(String contactPhone) { 
        this.contactPhone = contactPhone;
        if (this.publicPhone == null) this.publicPhone = contactPhone;
    }

    public String getPublicPhone() { 
        return publicPhone != null ? publicPhone : contactPhone; 
    }
    public void setPublicPhone(String publicPhone) { 
        this.publicPhone = publicPhone; 
        if (this.contactPhone == null) this.contactPhone = publicPhone;
    }

    public boolean isShowContactPhone() { return showContactPhone; }
    public void setShowContactPhone(boolean showContactPhone) { 
        this.showContactPhone = showContactPhone; 
        this.showPublicPhone = showContactPhone;
    }

    public boolean isShowPublicPhone() { return showPublicPhone; }
    public void setShowPublicPhone(boolean showPublicPhone) { 
        this.showPublicPhone = showPublicPhone; 
        this.showContactPhone = showPublicPhone;
    }
}
