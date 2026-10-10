package org.sharingfood.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class VolunteerActivityDto {
    private UUID id;
    private String activityType;
    private String description;
    private BigDecimal hoursSpent;
    private LocalDate activityDate;
    private Instant createdAt;

    public VolunteerActivityDto() {}

    public VolunteerActivityDto(UUID id, String activityType, String description, BigDecimal hoursSpent, LocalDate activityDate, Instant createdAt) {
        this.id = id;
        this.activityType = activityType;
        this.description = description;
        this.hoursSpent = hoursSpent;
        this.activityDate = activityDate;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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
