package org.sharingfood.service;

import org.sharingfood.dto.PlatformImpactDto;
import org.sharingfood.entity.*;
import org.sharingfood.repository.AddressRepository;
import org.sharingfood.repository.DonationRepository;
import org.sharingfood.repository.OrganizationMemberRepository;
import org.sharingfood.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ImpactService {

    private final DonationRepository donationRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final AddressRepository addressRepository;

    public ImpactService(
            DonationRepository donationRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            AddressRepository addressRepository
    ) {
        this.donationRepository = donationRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.addressRepository = addressRepository;
    }

    @Transactional(readOnly = true)
    public PlatformImpactDto getPlatformImpact() {
        long totalMeals = donationRepository.sumEstimatedMealsCompleted();
        long completedPickups = donationRepository.countByStatus(DonationStatus.COMPLETED);
        long totalDonations = donationRepository.count();

        // Count only active organizations that have non-deleted, verified member accounts
        List<Organization> activeOrgs = organizationRepository.findByIsActiveTrue().stream()
                .filter(org -> {
                    List<OrganizationMember> members = organizationMemberRepository.findByOrganization(org);
                    if (members.isEmpty()) return false;
                    return members.stream().anyMatch(m ->
                            m.getUser() != null &&
                            m.getUser().getStatus() != UserStatus.DELETED &&
                            m.getUser().getStatus() != UserStatus.PENDING_OTP_VERIFICATION
                    );
                })
                .collect(Collectors.toList());

        long activeSuppliers = activeOrgs.stream().filter(o -> isSupplier(o.getType())).count();
        long activeBeneficiaries = activeOrgs.stream().filter(o -> isBeneficiary(o.getType())).count();

        double rescueRate = 100.0;
        if (totalDonations > 0) {
            rescueRate = Math.round(((double) completedPickups / totalDonations) * 1000.0) / 10.0;
        }

        long uniqueCities = addressRepository.findAll().stream()
                .map(Address::getCity)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .distinct()
                .count();

        return new PlatformImpactDto(
                totalMeals,
                activeSuppliers,
                activeBeneficiaries,
                completedPickups,
                totalDonations,
                rescueRate,
                Math.max(1, uniqueCities)
        );
    }

    private boolean isSupplier(OrganizationType type) {
        return type == OrganizationType.RESTAURANT || type == OrganizationType.BAKERY ||
               type == OrganizationType.CATERER || type == OrganizationType.CORPORATE_CAFETERIA;
    }

    private boolean isBeneficiary(OrganizationType type) {
        return type == OrganizationType.OLD_AGE_HOME || type == OrganizationType.ORPHANAGE ||
               type == OrganizationType.COMMUNITY_SHELTER;
    }
}
