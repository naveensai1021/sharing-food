package org.sharingfood.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateReportRequest {

    @NotBlank(message = "Target type is required (e.g. POST, USER, DONATION, ORGANIZATION)")
    private String targetType;

    @NotNull(message = "Target ID is required")
    private UUID targetId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String description;

    public CreateReportRequest() {}

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public UUID getTargetId() {
        return targetId;
    }

    public void setTargetId(UUID targetId) {
        this.targetId = targetId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
