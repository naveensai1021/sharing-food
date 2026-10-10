package org.sharingfood.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_user_id", nullable = false)
    private User reviewerUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_organization_id", nullable = false)
    private Organization revieweeOrganization;

    @Column(nullable = false)
    private int rating;

    @Column(name = "punctuality_rating")
    private Integer punctualityRating;

    @Column(name = "communication_rating")
    private Integer communicationRating;

    @Column(name = "coordination_rating")
    private Integer coordinationRating;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Review() {}

    public Review(Donation donation, User reviewerUser, Organization revieweeOrganization, int rating, Integer punctualityRating, Integer communicationRating, Integer coordinationRating, String comments) {
        this.donation = donation;
        this.reviewerUser = reviewerUser;
        this.revieweeOrganization = revieweeOrganization;
        this.rating = rating;
        this.punctualityRating = punctualityRating;
        this.communicationRating = communicationRating;
        this.coordinationRating = coordinationRating;
        this.comments = comments;
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

    public User getReviewerUser() {
        return reviewerUser;
    }

    public void setReviewerUser(User reviewerUser) {
        this.reviewerUser = reviewerUser;
    }

    public Organization getRevieweeOrganization() {
        return revieweeOrganization;
    }

    public void setRevieweeOrganization(Organization revieweeOrganization) {
        this.revieweeOrganization = revieweeOrganization;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public Integer getPunctualityRating() {
        return punctualityRating;
    }

    public void setPunctualityRating(Integer punctualityRating) {
        this.punctualityRating = punctualityRating;
    }

    public Integer getCommunicationRating() {
        return communicationRating;
    }

    public void setCommunicationRating(Integer communicationRating) {
        this.communicationRating = communicationRating;
    }

    public Integer getCoordinationRating() {
        return coordinationRating;
    }

    public void setCoordinationRating(Integer coordinationRating) {
        this.coordinationRating = coordinationRating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
