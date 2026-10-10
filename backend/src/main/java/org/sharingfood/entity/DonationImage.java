package org.sharingfood.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "donation_images")
public class DonationImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    @JsonIgnore
    private Donation donation;

    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "is_primary", nullable = false)
    private boolean isPrimary = false;

    public DonationImage() {}

    public DonationImage(String imageUrl, boolean isPrimary) {
        this.imageUrl = imageUrl;
        this.isPrimary = isPrimary;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }
}
