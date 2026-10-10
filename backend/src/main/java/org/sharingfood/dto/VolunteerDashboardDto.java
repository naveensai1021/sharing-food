package org.sharingfood.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class VolunteerDashboardDto {
    private String volunteerCode;
    private String verificationStatus;
    private String rejectionReason;
    private int organizationsContactedCount;
    private int organizationsOnboardedCount;
    private int donationsAssistedCount;
    private int activitiesCompletedCount;
    private BigDecimal totalHoursSpent = BigDecimal.ZERO;
    private int activeDaysCount;
    private List<VolunteerLeadDto> recentLeads = new ArrayList<>();
    private List<VolunteerActivityDto> recentActivities = new ArrayList<>();

    public VolunteerDashboardDto() {}

    public String getVolunteerCode() {
        return volunteerCode;
    }

    public void setVolunteerCode(String volunteerCode) {
        this.volunteerCode = volunteerCode;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public int getOrganizationsContactedCount() {
        return organizationsContactedCount;
    }

    public void setOrganizationsContactedCount(int organizationsContactedCount) {
        this.organizationsContactedCount = organizationsContactedCount;
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

    public BigDecimal getTotalHoursSpent() {
        return totalHoursSpent;
    }

    public void setTotalHoursSpent(BigDecimal totalHoursSpent) {
        this.totalHoursSpent = totalHoursSpent;
    }

    public int getActiveDaysCount() {
        return activeDaysCount;
    }

    public void setActiveDaysCount(int activeDaysCount) {
        this.activeDaysCount = activeDaysCount;
    }

    public List<VolunteerLeadDto> getRecentLeads() {
        return recentLeads;
    }

    public void setRecentLeads(List<VolunteerLeadDto> recentLeads) {
        this.recentLeads = recentLeads;
    }

    public List<VolunteerActivityDto> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<VolunteerActivityDto> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
