package org.sharingfood.dto;

import java.util.ArrayList;
import java.util.List;

public class SupplierSummaryDto {
    private int totalDonations;
    private int activeDonations;
    private int completedDonations;
    private int totalServingsDonated;
    private int beneficiariesHelped;
    private List<DonationDto> recentDonations = new ArrayList<>();

    public SupplierSummaryDto() {}

    public int getTotalDonations() {
        return totalDonations;
    }

    public void setTotalDonations(int totalDonations) {
        this.totalDonations = totalDonations;
    }

    public int getActiveDonations() {
        return activeDonations;
    }

    public void setActiveDonations(int activeDonations) {
        this.activeDonations = activeDonations;
    }

    public int getCompletedDonations() {
        return completedDonations;
    }

    public void setCompletedDonations(int completedDonations) {
        this.completedDonations = completedDonations;
    }

    public int getTotalServingsDonated() {
        return totalServingsDonated;
    }

    public void setTotalServingsDonated(int totalServingsDonated) {
        this.totalServingsDonated = totalServingsDonated;
    }

    public int getBeneficiariesHelped() {
        return beneficiariesHelped;
    }

    public void setBeneficiariesHelped(int beneficiariesHelped) {
        this.beneficiariesHelped = beneficiariesHelped;
    }

    public List<DonationDto> getRecentDonations() {
        return recentDonations;
    }

    public void setRecentDonations(List<DonationDto> recentDonations) {
        this.recentDonations = recentDonations;
    }
}
