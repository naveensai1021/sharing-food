package org.sharingfood.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Organization supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "food_category", nullable = false, length = 50)
    private FoodCategory foodCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "dietary_type", nullable = false, length = 50)
    private DietaryType dietaryType;

    @Column(name = "approximate_quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal approximateQuantity;

    @Column(name = "quantity_unit", nullable = false, length = 50)
    private String quantityUnit;

    @Column(name = "estimated_servings", nullable = false)
    private int estimatedServings;

    @Column(name = "preparation_time", nullable = false)
    private Instant preparationTime;

    @Column(name = "pickup_available_from", nullable = false)
    private Instant pickupAvailableFrom;

    @Column(name = "pickup_available_until", nullable = false)
    private Instant pickupAvailableUntil;

    @Column(name = "consume_before_time", nullable = false)
    private Instant consumeBeforeTime;

    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "pickup_address_id")
    private Address pickupAddress;

    @Column(name = "packaging_status")
    private String packagingStatus;

    @Column(columnDefinition = "TEXT")
    private String allergens;

    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions;

    @Column(name = "pickup_instructions", columnDefinition = "TEXT")
    private String pickupInstructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DonationStatus status = DonationStatus.AVAILABLE;

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DonationFoodItem> foodItems = new ArrayList<>();

    @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DonationImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL)
    private FoodSafetyDeclaration foodSafetyDeclaration;

    @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL)
    private DonationAcceptance acceptance;

    @OneToOne(mappedBy = "donation", cascade = CascadeType.ALL)
    private Pickup pickup;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Donation() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Organization getSupplier() {
        return supplier;
    }

    public void setSupplier(Organization supplier) {
        this.supplier = supplier;
    }

    public User getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(User createdByUser) {
        this.createdByUser = createdByUser;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public FoodCategory getFoodCategory() {
        return foodCategory;
    }

    public void setFoodCategory(FoodCategory foodCategory) {
        this.foodCategory = foodCategory;
    }

    public DietaryType getDietaryType() {
        return dietaryType;
    }

    public void setDietaryType(DietaryType dietaryType) {
        this.dietaryType = dietaryType;
    }

    public BigDecimal getApproximateQuantity() {
        return approximateQuantity;
    }

    public void setApproximateQuantity(BigDecimal approximateQuantity) {
        this.approximateQuantity = approximateQuantity;
    }

    public String getQuantityUnit() {
        return quantityUnit;
    }

    public void setQuantityUnit(String quantityUnit) {
        this.quantityUnit = quantityUnit;
    }

    public int getEstimatedServings() {
        return estimatedServings;
    }

    public void setEstimatedServings(int estimatedServings) {
        this.estimatedServings = estimatedServings;
    }

    public Instant getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(Instant preparationTime) {
        this.preparationTime = preparationTime;
    }

    public Instant getPickupAvailableFrom() {
        return pickupAvailableFrom;
    }

    public void setPickupAvailableFrom(Instant pickupAvailableFrom) {
        this.pickupAvailableFrom = pickupAvailableFrom;
    }

    public Instant getPickupAvailableUntil() {
        return pickupAvailableUntil;
    }

    public void setPickupAvailableUntil(Instant pickupAvailableUntil) {
        this.pickupAvailableUntil = pickupAvailableUntil;
    }

    public Instant getConsumeBeforeTime() {
        return consumeBeforeTime;
    }

    public void setConsumeBeforeTime(Instant consumeBeforeTime) {
        this.consumeBeforeTime = consumeBeforeTime;
    }

    public Address getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(Address pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getPackagingStatus() {
        return packagingStatus;
    }

    public void setPackagingStatus(String packagingStatus) {
        this.packagingStatus = packagingStatus;
    }

    public String getAllergens() {
        return allergens;
    }

    public void setAllergens(String allergens) {
        this.allergens = allergens;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public String getPickupInstructions() {
        return pickupInstructions;
    }

    public void setPickupInstructions(String pickupInstructions) {
        this.pickupInstructions = pickupInstructions;
    }

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public List<DonationFoodItem> getFoodItems() {
        return foodItems;
    }

    public void setFoodItems(List<DonationFoodItem> foodItems) {
        this.foodItems = foodItems;
    }

    public void addFoodItem(DonationFoodItem item) {
        this.foodItems.add(item);
        item.setDonation(this);
    }

    public List<DonationImage> getImages() {
        return images;
    }

    public void setImages(List<DonationImage> images) {
        this.images = images;
    }

    public void addImage(DonationImage image) {
        this.images.add(image);
        image.setDonation(this);
    }

    public FoodSafetyDeclaration getFoodSafetyDeclaration() {
        return foodSafetyDeclaration;
    }

    public void setFoodSafetyDeclaration(FoodSafetyDeclaration foodSafetyDeclaration) {
        this.foodSafetyDeclaration = foodSafetyDeclaration;
        if (foodSafetyDeclaration != null) {
            foodSafetyDeclaration.setDonation(this);
        }
    }

    public DonationAcceptance getAcceptance() {
        return acceptance;
    }

    public void setAcceptance(DonationAcceptance acceptance) {
        this.acceptance = acceptance;
        if (acceptance != null) {
            acceptance.setDonation(this);
        }
    }

    public Pickup getPickup() {
        return pickup;
    }

    public void setPickup(Pickup pickup) {
        this.pickup = pickup;
        if (pickup != null) {
            pickup.setDonation(this);
        }
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
