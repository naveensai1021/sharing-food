package org.sharingfood.dto;

public class PlatformImpactDto {
    private long totalMealsRescued;
    private long activeSuppliers;
    private long activeBeneficiaries;
    private long completedPickups;
    private long totalDonations;
    private double rescueRate;
    private long citiesCount;

    public PlatformImpactDto() {}

    public PlatformImpactDto(long totalMealsRescued, long activeSuppliers, long activeBeneficiaries,
                             long completedPickups, long totalDonations, double rescueRate, long citiesCount) {
        this.totalMealsRescued = totalMealsRescued;
        this.activeSuppliers = activeSuppliers;
        this.activeBeneficiaries = activeBeneficiaries;
        this.completedPickups = completedPickups;
        this.totalDonations = totalDonations;
        this.rescueRate = rescueRate;
        this.citiesCount = citiesCount;
    }

    public long getTotalMealsRescued() {
        return totalMealsRescued;
    }

    public void setTotalMealsRescued(long totalMealsRescued) {
        this.totalMealsRescued = totalMealsRescued;
    }

    public long getActiveSuppliers() {
        return activeSuppliers;
    }

    public void setActiveSuppliers(long activeSuppliers) {
        this.activeSuppliers = activeSuppliers;
    }

    public long getActiveBeneficiaries() {
        return activeBeneficiaries;
    }

    public void setActiveBeneficiaries(long activeBeneficiaries) {
        this.activeBeneficiaries = activeBeneficiaries;
    }

    public long getCompletedPickups() {
        return completedPickups;
    }

    public void setCompletedPickups(long completedPickups) {
        this.completedPickups = completedPickups;
    }

    public long getTotalDonations() {
        return totalDonations;
    }

    public void setTotalDonations(long totalDonations) {
        this.totalDonations = totalDonations;
    }

    public double getRescueRate() {
        return rescueRate;
    }

    public void setRescueRate(double rescueRate) {
        this.rescueRate = rescueRate;
    }

    public long getCitiesCount() {
        return citiesCount;
    }

    public void setCitiesCount(long citiesCount) {
        this.citiesCount = citiesCount;
    }
}
