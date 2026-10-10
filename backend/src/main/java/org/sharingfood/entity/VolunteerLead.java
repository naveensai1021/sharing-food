package org.sharingfood.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "volunteer_leads")
public class VolunteerLead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_user_id", nullable = false)
    private User volunteerUser;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "organization_type", nullable = false, length = 50)
    private String organizationType;

    @Column(name = "contact_name")
    private String contactName;

    @Column(length = 50)
    private String phone;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;

    @Column(nullable = false, length = 50)
    private String status = "NEW"; // NEW, CONTACTED, INTERESTED, JOINED, NOT_INTERESTED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public VolunteerLead() {}

    public VolunteerLead(User volunteerUser, String organizationName, String organizationType, String contactName, String phone, String email, String address, String city, String notes) {
        this.volunteerUser = volunteerUser;
        this.organizationName = organizationName;
        this.organizationType = organizationType;
        this.contactName = contactName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.city = city;
        this.notes = notes;
        this.status = "NEW";
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getVolunteerUser() {
        return volunteerUser;
    }

    public void setVolunteerUser(User volunteerUser) {
        this.volunteerUser = volunteerUser;
    }

    public String getOrganizationName() {
        return organizationName;
    }

    public void setOrganizationName(String organizationName) {
        this.organizationName = organizationName;
    }

    public String getOrganizationType() {
        return organizationType;
    }

    public void setOrganizationType(String organizationType) {
        this.organizationType = organizationType;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
