package org.sharingfood.dto;

import org.sharingfood.entity.DietaryType;
import org.sharingfood.entity.FoodCategory;

import java.time.Instant;

public class UpdateDonationRequest {
    private String title;
    private String description;
    private FoodCategory foodCategory;
    private DietaryType dietaryType;
    private Integer estimatedServings;
    private Instant pickupAvailableUntil;
    private Instant consumeBeforeTime;
    private String packagingStatus;
    private String allergens;
    private String specialInstructions;
    private String pickupInstructions;

    public UpdateDonationRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public FoodCategory getFoodCategory() { return foodCategory; }
    public void setFoodCategory(FoodCategory foodCategory) { this.foodCategory = foodCategory; }
    public DietaryType getDietaryType() { return dietaryType; }
    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public Integer getEstimatedServings() { return estimatedServings; }
    public void setEstimatedServings(Integer estimatedServings) { this.estimatedServings = estimatedServings; }
    public Instant getPickupAvailableUntil() { return pickupAvailableUntil; }
    public void setPickupAvailableUntil(Instant pickupAvailableUntil) { this.pickupAvailableUntil = pickupAvailableUntil; }
    public Instant getConsumeBeforeTime() { return consumeBeforeTime; }
    public void setConsumeBeforeTime(Instant consumeBeforeTime) { this.consumeBeforeTime = consumeBeforeTime; }
    public String getPackagingStatus() { return packagingStatus; }
    public void setPackagingStatus(String packagingStatus) { this.packagingStatus = packagingStatus; }
    public String getAllergens() { return allergens; }
    public void setAllergens(String allergens) { this.allergens = allergens; }
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    public String getPickupInstructions() { return pickupInstructions; }
    public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }
}
