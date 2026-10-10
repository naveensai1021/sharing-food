package org.sharingfood.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.sharingfood.entity.DietaryType;
import org.sharingfood.entity.FoodCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class CreateDonationRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Food category is required")
    private FoodCategory foodCategory;

    @NotNull(message = "Dietary type is required")
    private DietaryType dietaryType;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal approximateQuantity;

    @NotBlank(message = "Quantity unit is required")
    private String quantityUnit;

    @Positive(message = "Estimated servings must be at least 1")
    private int estimatedServings;

    @NotNull(message = "Preparation time is required")
    private Instant preparationTime;

    @NotNull(message = "Pickup start time is required")
    private Instant pickupAvailableFrom;

    @NotNull(message = "Pickup deadline is required")
    private Instant pickupAvailableUntil;

    @NotNull(message = "Consume before time is required")
    private Instant consumeBeforeTime;

    private String packagingStatus;
    private String allergens;
    private String specialInstructions;
    private String pickupInstructions;

    private List<FoodItemDto> foodItems = new ArrayList<>();
    private List<String> imageUrls = new ArrayList<>();

    // Address override if different from default supplier address
    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Section 16 Food Safety pledge confirmation
    @AssertTrue(message = "You must confirm the food safety declaration before publishing.")
    private boolean safetyDeclarationConfirmed;

    public CreateDonationRequest() {}

    public static class FoodItemDto {
        private String itemName;
        private String quantity;

        public FoodItemDto() {}

        public FoodItemDto(String itemName, String quantity) {
            this.itemName = itemName;
            this.quantity = quantity;
        }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getQuantity() { return quantity; }
        public void setQuantity(String quantity) { this.quantity = quantity; }
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public FoodCategory getFoodCategory() { return foodCategory; }
    public void setFoodCategory(FoodCategory foodCategory) { this.foodCategory = foodCategory; }
    public DietaryType getDietaryType() { return dietaryType; }
    public void setDietaryType(DietaryType dietaryType) { this.dietaryType = dietaryType; }
    public BigDecimal getApproximateQuantity() { return approximateQuantity; }
    public void setApproximateQuantity(BigDecimal approximateQuantity) { this.approximateQuantity = approximateQuantity; }
    public String getQuantityUnit() { return quantityUnit; }
    public void setQuantityUnit(String quantityUnit) { this.quantityUnit = quantityUnit; }
    public int getEstimatedServings() { return estimatedServings; }
    public void setEstimatedServings(int estimatedServings) { this.estimatedServings = estimatedServings; }
    public Instant getPreparationTime() { return preparationTime; }
    public void setPreparationTime(Instant preparationTime) { this.preparationTime = preparationTime; }
    public Instant getPickupAvailableFrom() { return pickupAvailableFrom; }
    public void setPickupAvailableFrom(Instant pickupAvailableFrom) { this.pickupAvailableFrom = pickupAvailableFrom; }
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
    public List<FoodItemDto> getFoodItems() { return foodItems; }
    public void setFoodItems(List<FoodItemDto> foodItems) { this.foodItems = foodItems; }
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public String getStreetAddress() { return streetAddress; }
    public void setStreetAddress(String streetAddress) { this.streetAddress = streetAddress; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public boolean isSafetyDeclarationConfirmed() { return safetyDeclarationConfirmed; }
    public void setSafetyDeclarationConfirmed(boolean safetyDeclarationConfirmed) { this.safetyDeclarationConfirmed = safetyDeclarationConfirmed; }
}
