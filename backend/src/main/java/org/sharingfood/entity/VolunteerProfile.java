package org.sharingfood.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "volunteer_profiles")
public class VolunteerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "volunteer_code", unique = true, length = 50)
    private String volunteerCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 50)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING_VERIFICATION;

    @Column(name = "profile_photo_url", columnDefinition = "TEXT")
    private String profilePhotoUrl;

    @Column(name = "id_proof_url", columnDefinition = "TEXT")
    private String idProofUrl;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "verification_submitted_at")
    private Instant verificationSubmittedAt;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by_admin_id")
    private UUID verifiedByAdminId;

    @Column(length = 100)
    private String city;

    @Column(name = "service_area")
    private String serviceArea;

    @Column(columnDefinition = "TEXT")
    private String interests;

    @Column(name = "id_proof_type", length = 50)
    private String idProofType;

    @Column(name = "id_proof_number", length = 100)
    private String idProofNumber;

    @Column(name = "organizations_contacted_count", nullable = false)
    private int organizationsContactedCount = 0;

    @Column(name = "organizations_onboarded_count", nullable = false)
    private int organizationsOnboardedCount = 0;

    @Column(name = "donations_assisted_count", nullable = false)
    private int donationsAssistedCount = 0;

    @Column(name = "activities_completed_count", nullable = false)
    private int activitiesCompletedCount = 0;

    @Column(name = "active_days_count", nullable = false)
    private int activeDaysCount = 0;

    public VolunteerProfile() {}

    public VolunteerProfile(User user, String profilePhotoUrl, String idProofUrl, String city, String serviceArea, String interests) {
        this.user = user;
        this.profilePhotoUrl = profilePhotoUrl;
        this.idProofUrl = idProofUrl;
        this.city = city;
        this.serviceArea = serviceArea;
        this.interests = interests;
        this.verificationStatus = VerificationStatus.PENDING_VERIFICATION;
        this.verificationSubmittedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getVolunteerCode() {
        return volunteerCode;
    }

    public void setVolunteerCode(String volunteerCode) {
        this.volunteerCode = volunteerCode;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getIdProofUrl() {
        return idProofUrl;
    }

    public void setIdProofUrl(String idProofUrl) {
        this.idProofUrl = idProofUrl;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Instant getVerificationSubmittedAt() {
        return verificationSubmittedAt;
    }

    public void setVerificationSubmittedAt(Instant verificationSubmittedAt) {
        this.verificationSubmittedAt = verificationSubmittedAt;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public UUID getVerifiedByAdminId() {
        return verifiedByAdminId;
    }

    public void setVerifiedByAdminId(UUID verifiedByAdminId) {
        this.verifiedByAdminId = verifiedByAdminId;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getServiceArea() {
        return serviceArea;
    }

    public void setServiceArea(String serviceArea) {
        this.serviceArea = serviceArea;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public int getOrganizationsOnboardedCount() {
        return organizationsOnboardedCount;
    }

    public void setOrganizationsOnboardedCount(int organizationsOnboardedCount) {
        this.organizationsOnboardedCount = organizationsOnboardedCount;
    }

    public int getDonationsAssistedCount() {
        return donationsAssistedCount;
    }

    public void setDonationsAssistedCount(int donationsAssistedCount) {
        this.donationsAssistedCount = donationsAssistedCount;
    }

    public int getActivitiesCompletedCount() {
        return activitiesCompletedCount;
    }

    public void setActivitiesCompletedCount(int activitiesCompletedCount) {
        this.activitiesCompletedCount = activitiesCompletedCount;
    }

    public int getActiveDaysCount() {
        return activeDaysCount;
    }

    public void setActiveDaysCount(int activeDaysCount) {
        this.activeDaysCount = activeDaysCount;
    }

    public String getIdProofType() {
        return idProofType;
    }

    public void setIdProofType(String idProofType) {
        this.idProofType = idProofType;
    }

    public String getIdProofNumber() {
        return idProofNumber;
    }

    public void setIdProofNumber(String idProofNumber) {
        this.idProofNumber = idProofNumber;
    }

    public int getOrganizationsContactedCount() {
        return organizationsContactedCount;
    }

    public void setOrganizationsContactedCount(int organizationsContactedCount) {
        this.organizationsContactedCount = organizationsContactedCount;
    }

    public String getIdProofDocumentUrl() {
        return idProofUrl;
    }

    public void setIdProofDocumentUrl(String idProofDocumentUrl) {
        this.idProofUrl = idProofDocumentUrl;
    }

    public Instant getCreatedAt() {
        return verificationSubmittedAt != null ? verificationSubmittedAt : (verifiedAt != null ? verifiedAt : Instant.now());
    }
}
