package org.sharingfood.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "volunteer_activities")
public class VolunteerActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_user_id", nullable = false)
    private User volunteerUser;

    @Column(name = "activity_type", nullable = false, length = 100)
    private String activityType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "hours_spent", precision = 4, scale = 2)
    private BigDecimal hoursSpent = new BigDecimal("1.0");

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate = LocalDate.now();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public VolunteerActivity() {}

    public VolunteerActivity(User volunteerUser, String activityType, String description, BigDecimal hoursSpent, LocalDate activityDate) {
        this.volunteerUser = volunteerUser;
        this.activityType = activityType;
        this.description = description;
        this.hoursSpent = hoursSpent;
        this.activityDate = activityDate;
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

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getHoursSpent() {
        return hoursSpent;
    }

    public void setHoursSpent(BigDecimal hoursSpent) {
        this.hoursSpent = hoursSpent;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
