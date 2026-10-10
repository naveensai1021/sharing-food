package org.sharingfood.dto;

import java.util.ArrayList;
import java.util.List;

public class BeneficiarySummaryDto {
    private int totalClaimed;
    private int activePickups;
    private int completedPickups;
    private int totalServingsReceived;
    private int availableNearbyCount;
    private List<DonationDto> recentPickups = new ArrayList<>();

    public BeneficiarySummaryDto() {}

    public int getTotalClaimed() {
        return totalClaimed;
    }

    public void setTotalClaimed(int totalClaimed) {
        this.totalClaimed = totalClaimed;
    }

    public int getActivePickups() {
        return activePickups;
    }

    public void setActivePickups(int activePickups) {
        this.activePickups = activePickups;
    }

    public int getCompletedPickups() {
        return completedPickups;
    }

    public void setCompletedPickups(int completedPickups) {
        this.completedPickups = completedPickups;
    }

    public int getTotalServingsReceived() {
        return totalServingsReceived;
    }

    public void setTotalServingsReceived(int totalServingsReceived) {
        this.totalServingsReceived = totalServingsReceived;
    }

    public int getAvailableNearbyCount() {
        return availableNearbyCount;
    }

    public void setAvailableNearbyCount(int availableNearbyCount) {
        this.availableNearbyCount = availableNearbyCount;
    }

    public List<DonationDto> getRecentPickups() {
        return recentPickups;
    }

    public void setRecentPickups(List<DonationDto> recentPickups) {
        this.recentPickups = recentPickups;
    }
}
