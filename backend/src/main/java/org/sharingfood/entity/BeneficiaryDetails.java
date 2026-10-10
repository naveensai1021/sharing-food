package org.sharingfood.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "beneficiary_details")
public class BeneficiaryDetails {

    @Id
    private UUID organizationId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @Column(name = "beneficiary_type", nullable = false, length = 50)
    private String beneficiaryType; // OLD_AGE_HOME, ORPHANAGE, SHELTER, OTHER

    @Column(name = "resident_count")
    private Integer residentCount = 0;

    @Column(name = "food_capacity_servings")
    private Integer foodCapacityServings = 0;

    @Column(name = "dietary_preferences", columnDefinition = "TEXT")
    private String dietaryPreferences;

    public BeneficiaryDetails() {}

    public BeneficiaryDetails(Organization organization, String beneficiaryType, Integer residentCount, Integer foodCapacityServings, String dietaryPreferences) {
        this.organization = organization;
        this.beneficiaryType = beneficiaryType;
        this.residentCount = residentCount;
        this.foodCapacityServings = foodCapacityServings;
        this.dietaryPreferences = dietaryPreferences;
    }

    public UUID getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(UUID organizationId) {
        this.organizationId = organizationId;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getBeneficiaryType() {
        return beneficiaryType;
    }

    public void setBeneficiaryType(String beneficiaryType) {
        this.beneficiaryType = beneficiaryType;
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
}
