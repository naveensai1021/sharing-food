package org.sharingfood.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "donation_acceptances")
public class DonationAcceptance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", unique = true, nullable = false)
    @JsonIgnore
    private Donation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "beneficiary_id", nullable = false)
    private Organization beneficiary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_user_id", nullable = false)
    private User acceptedByUser;

    @CreationTimestamp
    @Column(name = "accepted_at", nullable = false, updatable = false)
    private Instant acceptedAt;

    @Column(nullable = false, length = 50)
    private String status = "RESERVED";

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "requested_servings")
    private Integer requestedServings;

    public DonationAcceptance() {}

    public DonationAcceptance(Donation donation, Organization beneficiary, User acceptedByUser) {
        this.donation = donation;
        this.beneficiary = beneficiary;
        this.acceptedByUser = acceptedByUser;
        this.status = "RESERVED";
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

    public Organization getBeneficiary() {
        return beneficiary;
    }

    public void setBeneficiary(Organization beneficiary) {
        this.beneficiary = beneficiary;
    }

    public User getAcceptedByUser() {
        return acceptedByUser;
    }

    public void setAcceptedByUser(User acceptedByUser) {
        this.acceptedByUser = acceptedByUser;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Instant acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Integer getRequestedServings() {
        return requestedServings;
    }

    public void setRequestedServings(Integer requestedServings) {
        this.requestedServings = requestedServings;
    }
}
