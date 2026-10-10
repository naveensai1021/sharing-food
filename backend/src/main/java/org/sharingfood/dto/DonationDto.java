package org.sharingfood.dto;

import org.sharingfood.entity.DietaryType;
import org.sharingfood.entity.DonationStatus;
import org.sharingfood.entity.FoodCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class DonationDto {
    private UUID id;
    private UUID supplierId;
    private String supplierName;
    private String supplierLogoUrl;
    private String supplierPhotoUrl;
    private String supplierPhone;
    private String supplierAddress;
    private String supplierLocality;
    private String supplierCity;
    private String supplierState;
    private String supplierPostalCode;
    private Double supplierLatitude;
    private Double supplierLongitude;
    private String title;
    private String description;
    private FoodCategory foodCategory;
    private DietaryType dietaryType;
    private BigDecimal approximateQuantity;
    private String quantityUnit;
    private int estimatedServings;
    private Instant preparationTime;
    private Instant pickupAvailableFrom;
    private Instant pickupAvailableUntil;
    private Instant consumeBeforeTime;
    private DonationStatus status;
    private String packagingStatus;
    private String allergens;
    private String specialInstructions;
    private String pickupInstructions;

    private AddressDto address;
    private Double distanceKm;

    private List<FoodItemDto> foodItems = new ArrayList<>();
    private List<ImageDto> images = new ArrayList<>();

    private UUID acceptedByBeneficiaryId;
    private String acceptedByBeneficiaryName;
    private Instant acceptedAt;
    private String acceptanceStatus;

    private Instant pickupReadyAt;
    private Instant pickupStartedAt;
    private Instant pickupCollectedAt;
    private Instant completedAt;
    private boolean handoverConfirmed;
    private boolean otpVerified;
    private Instant otpExpiresAt;
    private String pickupOtp;

    private Instant createdAt;

    public DonationDto() {}

    public static class AddressDto {
        private String streetAddress;
        private String city;
        private String state;
        private String postalCode;
        private BigDecimal latitude;
        private BigDecimal longitude;

        public AddressDto() {}

        public AddressDto(String streetAddress, String city, String state, String postalCode, BigDecimal latitude, BigDecimal longitude) {
            this.streetAddress = streetAddress;
            this.city = city;
            this.state = state;
            this.postalCode = postalCode;
            this.latitude = latitude;
            this.longitude = longitude;
        }

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
    }

    public static class FoodItemDto {
        private UUID id;
        private String itemName;
        private String quantity;

        public FoodItemDto() {}
        public FoodItemDto(UUID id, String itemName, String quantity) {
            this.id = id;
            this.itemName = itemName;
            this.quantity = quantity;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getQuantity() { return quantity; }
        public void setQuantity(String quantity) { this.quantity = quantity; }
    }

    public static class ImageDto {
        private UUID id;
        private String imageUrl;
        private boolean isPrimary;

        public ImageDto() {}
        public ImageDto(UUID id, String imageUrl, boolean isPrimary) {
            this.id = id;
            this.imageUrl = imageUrl;
            this.isPrimary = isPrimary;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public boolean isPrimary() { return isPrimary; }
        public void setPrimary(boolean primary) { isPrimary = primary; }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSupplierId() { return supplierId; }
    public void setSupplierId(UUID supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getSupplierLogoUrl() { return supplierLogoUrl; }
    public void setSupplierLogoUrl(String supplierLogoUrl) { this.supplierLogoUrl = supplierLogoUrl; }
    public String getSupplierPhone() { return supplierPhone; }
    public void setSupplierPhone(String supplierPhone) { this.supplierPhone = supplierPhone; }
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
    public DonationStatus getStatus() { return status; }
    public void setStatus(DonationStatus status) { this.status = status; }
    public String getPackagingStatus() { return packagingStatus; }
    public void setPackagingStatus(String packagingStatus) { this.packagingStatus = packagingStatus; }
    public String getAllergens() { return allergens; }
    public void setAllergens(String allergens) { this.allergens = allergens; }
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    public String getPickupInstructions() { return pickupInstructions; }
    public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }
    public AddressDto getAddress() { return address; }
    public void setAddress(AddressDto address) { this.address = address; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public List<FoodItemDto> getFoodItems() { return foodItems; }
    public void setFoodItems(List<FoodItemDto> foodItems) { this.foodItems = foodItems; }
    public List<ImageDto> getImages() { return images; }
    public void setImages(List<ImageDto> images) { this.images = images; }
    public UUID getAcceptedByBeneficiaryId() { return acceptedByBeneficiaryId; }
    public void setAcceptedByBeneficiaryId(UUID acceptedByBeneficiaryId) { this.acceptedByBeneficiaryId = acceptedByBeneficiaryId; }
    public String getAcceptedByBeneficiaryName() { return acceptedByBeneficiaryName; }
    public void setAcceptedByBeneficiaryName(String acceptedByBeneficiaryName) { this.acceptedByBeneficiaryName = acceptedByBeneficiaryName; }
    public Instant getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(Instant acceptedAt) { this.acceptedAt = acceptedAt; }
    public Instant getPickupReadyAt() { return pickupReadyAt; }
    public void setPickupReadyAt(Instant pickupReadyAt) { this.pickupReadyAt = pickupReadyAt; }
    public Instant getPickupStartedAt() { return pickupStartedAt; }
    public void setPickupStartedAt(Instant pickupStartedAt) { this.pickupStartedAt = pickupStartedAt; }
    public Instant getPickupCollectedAt() { return pickupCollectedAt; }
    public void setPickupCollectedAt(Instant pickupCollectedAt) { this.pickupCollectedAt = pickupCollectedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public boolean isHandoverConfirmed() { return handoverConfirmed; }
    public void setHandoverConfirmed(boolean handoverConfirmed) { this.handoverConfirmed = handoverConfirmed; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getSupplierPhotoUrl() { return supplierPhotoUrl; }
    public void setSupplierPhotoUrl(String supplierPhotoUrl) { this.supplierPhotoUrl = supplierPhotoUrl; }

    public String getAcceptanceStatus() { return acceptanceStatus; }
    public void setAcceptanceStatus(String acceptanceStatus) { this.acceptanceStatus = acceptanceStatus; }

    public boolean isOtpVerified() { return otpVerified; }
    public void setOtpVerified(boolean otpVerified) { this.otpVerified = otpVerified; }

    public Instant getOtpExpiresAt() { return otpExpiresAt; }
    public void setOtpExpiresAt(Instant otpExpiresAt) { this.otpExpiresAt = otpExpiresAt; }

    public String getPickupOtp() { return pickupOtp; }
    public void setPickupOtp(String pickupOtp) { this.pickupOtp = pickupOtp; }

    public String getSupplierAddress() { return supplierAddress; }
    public void setSupplierAddress(String supplierAddress) { this.supplierAddress = supplierAddress; }
    public String getSupplierLocality() { return supplierLocality; }
    public void setSupplierLocality(String supplierLocality) { this.supplierLocality = supplierLocality; }
    public String getSupplierCity() { return supplierCity; }
    public void setSupplierCity(String supplierCity) { this.supplierCity = supplierCity; }
    public String getSupplierState() { return supplierState; }
    public void setSupplierState(String supplierState) { this.supplierState = supplierState; }
    public String getSupplierPostalCode() { return supplierPostalCode; }
    public void setSupplierPostalCode(String supplierPostalCode) { this.supplierPostalCode = supplierPostalCode; }
    public Double getSupplierLatitude() { return supplierLatitude; }
    public void setSupplierLatitude(Double supplierLatitude) { this.supplierLatitude = supplierLatitude; }
    public Double getSupplierLongitude() { return supplierLongitude; }
    public void setSupplierLongitude(Double supplierLongitude) { this.supplierLongitude = supplierLongitude; }
}
