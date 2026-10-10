package org.sharingfood.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "food_safety_declarations")
public class FoodSafetyDeclaration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", unique = true, nullable = false)
    @JsonIgnore
    private Donation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_user_id", nullable = false)
    private User supplierUser;

    @Column(name = "declaration_text", nullable = false, columnDefinition = "TEXT")
    private String declarationText;

    @Column(name = "declaration_version", nullable = false, length = 20)
    private String declarationVersion = "1.0";

    @CreationTimestamp
    @Column(name = "confirmed_at", nullable = false, updatable = false)
    private Instant confirmedAt;

    public FoodSafetyDeclaration() {}

    public FoodSafetyDeclaration(Donation donation, User supplierUser, String declarationText, String declarationVersion) {
        this.donation = donation;
        this.supplierUser = supplierUser;
        this.declarationText = declarationText;
        this.declarationVersion = declarationVersion;
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

    public User getSupplierUser() {
        return supplierUser;
    }

    public void setSupplierUser(User supplierUser) {
        this.supplierUser = supplierUser;
    }

    public String getDeclarationText() {
        return declarationText;
    }

    public void setDeclarationText(String declarationText) {
        this.declarationText = declarationText;
    }

    public String getDeclarationVersion() {
        return declarationVersion;
    }

    public void setDeclarationVersion(String declarationVersion) {
        this.declarationVersion = declarationVersion;
    }

    public Instant getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(Instant confirmedAt) {
        this.confirmedAt = confirmedAt;
    }
}
