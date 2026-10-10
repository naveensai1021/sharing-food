package org.sharingfood.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateVolunteerActivityRequest {

    @NotBlank(message = "Activity type is required (e.g. OUTREACH, FOOD_PICKUP_ASSISTANCE, DISTRIBUTION, BENEFICIARY_VISIT)")
    private String activityType;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotNull(message = "Hours spent is required")
    private BigDecimal hoursSpent;

    private LocalDate activityDate = LocalDate.now();

    public CreateVolunteerActivityRequest() {}

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
}
