package org.sharingfood.dto;

import java.util.ArrayList;
import java.util.List;

public class AdminDashboardDto {
    private long totalUsers;
    private long totalSuppliers;
    private long totalBeneficiaries;

    // Approval Metrics
    private long pendingSupplierApprovals;
    private long pendingBeneficiaryApprovals;
    private long approvedAccounts;
    private long rejectedAccounts;
    private long suspendedAccounts;

    // Operational Metrics
    private long totalDonations;
    private long availableDonations;
    private long reservedDonations;
    private long completedDonations;
    private long cancelledDonations;
    private long expiredDonations;
    private long totalPickupsCompleted;

    private long totalMealsRescued;
    private long citiesCount;

    private List<SupplierLeaderboardDto> topSuppliers = new ArrayList<>();
    private BeneficiaryAnalyticsDto beneficiaryAnalytics;

    public AdminDashboardDto() {}

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalSuppliers() {
        return totalSuppliers;
    }

    public void setTotalSuppliers(long totalSuppliers) {
        this.totalSuppliers = totalSuppliers;
    }

    public long getTotalBeneficiaries() {
        return totalBeneficiaries;
    }

    public void setTotalBeneficiaries(long totalBeneficiaries) {
        this.totalBeneficiaries = totalBeneficiaries;
    }

    public long getPendingSupplierApprovals() {
        return pendingSupplierApprovals;
    }

    public void setPendingSupplierApprovals(long pendingSupplierApprovals) {
        this.pendingSupplierApprovals = pendingSupplierApprovals;
    }

    public long getPendingBeneficiaryApprovals() {
        return pendingBeneficiaryApprovals;
    }

    public void setPendingBeneficiaryApprovals(long pendingBeneficiaryApprovals) {
        this.pendingBeneficiaryApprovals = pendingBeneficiaryApprovals;
    }

    public long getApprovedAccounts() {
        return approvedAccounts;
    }

    public void setApprovedAccounts(long approvedAccounts) {
        this.approvedAccounts = approvedAccounts;
    }

    public long getRejectedAccounts() {
        return rejectedAccounts;
    }

    public void setRejectedAccounts(long rejectedAccounts) {
        this.rejectedAccounts = rejectedAccounts;
    }

    public long getSuspendedAccounts() {
        return suspendedAccounts;
    }

    public void setSuspendedAccounts(long suspendedAccounts) {
        this.suspendedAccounts = suspendedAccounts;
    }

    public long getTotalDonations() {
        return totalDonations;
    }

    public void setTotalDonations(long totalDonations) {
        this.totalDonations = totalDonations;
    }

    public long getAvailableDonations() {
        return availableDonations;
    }

    public void setAvailableDonations(long availableDonations) {
        this.availableDonations = availableDonations;
    }

    public long getReservedDonations() {
        return reservedDonations;
    }

    public void setReservedDonations(long reservedDonations) {
        this.reservedDonations = reservedDonations;
    }

    public long getCompletedDonations() {
        return completedDonations;
    }

    public void setCompletedDonations(long completedDonations) {
        this.completedDonations = completedDonations;
    }

    public long getCancelledDonations() {
        return cancelledDonations;
    }

    public void setCancelledDonations(long cancelledDonations) {
        this.cancelledDonations = cancelledDonations;
    }

    public long getExpiredDonations() {
        return expiredDonations;
    }

    public void setExpiredDonations(long expiredDonations) {
        this.expiredDonations = expiredDonations;
    }

    public long getTotalPickupsCompleted() {
        return totalPickupsCompleted;
    }

    public void setTotalPickupsCompleted(long totalPickupsCompleted) {
        this.totalPickupsCompleted = totalPickupsCompleted;
    }

    public long getTotalMealsRescued() {
        return totalMealsRescued;
    }

    public void setTotalMealsRescued(long totalMealsRescued) {
        this.totalMealsRescued = totalMealsRescued;
    }

    public long getCitiesCount() {
        return citiesCount;
    }

    public void setCitiesCount(long citiesCount) {
        this.citiesCount = citiesCount;
    }

    public List<SupplierLeaderboardDto> getTopSuppliers() {
        return topSuppliers;
    }

    public void setTopSuppliers(List<SupplierLeaderboardDto> topSuppliers) {
        this.topSuppliers = topSuppliers;
    }

    public BeneficiaryAnalyticsDto getBeneficiaryAnalytics() {
        return beneficiaryAnalytics;
    }

    public void setBeneficiaryAnalytics(BeneficiaryAnalyticsDto beneficiaryAnalytics) {
        this.beneficiaryAnalytics = beneficiaryAnalytics;
    }

    // Nested DTOs
    public static class SupplierLeaderboardDto {
        private int rank;
        private String supplierName;
        private String city;
        private int totalDonations;
        private int completedDonations;
        private int mealsSupplied;
        private double completionRate;

        public SupplierLeaderboardDto() {}

        public SupplierLeaderboardDto(int rank, String supplierName, String city, int totalDonations, int completedDonations, int mealsSupplied, double completionRate) {
            this.rank = rank;
            this.supplierName = supplierName;
            this.city = city;
            this.totalDonations = totalDonations;
            this.completedDonations = completedDonations;
            this.mealsSupplied = mealsSupplied;
            this.completionRate = completionRate;
        }

        public int getRank() { return rank; }
        public void setRank(int rank) { this.rank = rank; }
        public String getSupplierName() { return supplierName; }
        public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public int getTotalDonations() { return totalDonations; }
        public void setTotalDonations(int totalDonations) { this.totalDonations = totalDonations; }
        public int getCompletedDonations() { return completedDonations; }
        public void setCompletedDonations(int completedDonations) { this.completedDonations = completedDonations; }
        public int getMealsSupplied() { return mealsSupplied; }
        public void setMealsSupplied(int mealsSupplied) { this.mealsSupplied = mealsSupplied; }
        public double getCompletionRate() { return completionRate; }
        public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }
    }

    public static class BeneficiaryAnalyticsDto {
        private int totalBeneficiaries;
        private long oldAgeHomesCount;
        private long orphanagesCount;
        private long otherCount;
        private long mealsReceived;
        private long pickupsCompleted;

        public BeneficiaryAnalyticsDto() {}

        public BeneficiaryAnalyticsDto(int totalBeneficiaries, long oldAgeHomesCount, long orphanagesCount, long otherCount, long mealsReceived, long pickupsCompleted) {
            this.totalBeneficiaries = totalBeneficiaries;
            this.oldAgeHomesCount = oldAgeHomesCount;
            this.orphanagesCount = orphanagesCount;
            this.otherCount = otherCount;
            this.mealsReceived = mealsReceived;
            this.pickupsCompleted = pickupsCompleted;
        }

        public int getTotalBeneficiaries() { return totalBeneficiaries; }
        public void setTotalBeneficiaries(int totalBeneficiaries) { this.totalBeneficiaries = totalBeneficiaries; }
        public long getOldAgeHomesCount() { return oldAgeHomesCount; }
        public void setOldAgeHomesCount(long oldAgeHomesCount) { this.oldAgeHomesCount = oldAgeHomesCount; }
        public long getOrphanagesCount() { return orphanagesCount; }
        public void setOrphanagesCount(long orphanagesCount) { this.orphanagesCount = orphanagesCount; }
        public long getOtherCount() { return otherCount; }
        public void setOtherCount(long otherCount) { this.otherCount = otherCount; }
        public long getMealsReceived() { return mealsReceived; }
        public void setMealsReceived(long mealsReceived) { this.mealsReceived = mealsReceived; }
        public long getPickupsCompleted() { return pickupsCompleted; }
        public void setPickupsCompleted(long pickupsCompleted) { this.pickupsCompleted = pickupsCompleted; }
    }
}
