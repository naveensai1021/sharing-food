package org.sharingfood.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "donation_food_items")
public class DonationFoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    @JsonIgnore
    private Donation donation;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(length = 100)
    private String quantity;

    public DonationFoodItem() {}

    public DonationFoodItem(String itemName, String quantity) {
        this.itemName = itemName;
        this.quantity = quantity;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Donation getDonation() {
        return donation;
    }

    public void setDonation(Donation donation) {
        this.donation = donation;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }
}
