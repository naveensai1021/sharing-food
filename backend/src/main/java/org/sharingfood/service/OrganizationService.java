package org.sharingfood.service;

import org.sharingfood.dto.OrganizationDirectoryDto;
import org.sharingfood.entity.Donation;
import org.sharingfood.entity.DonationStatus;
import org.sharingfood.entity.Organization;
import org.sharingfood.entity.OrganizationMember;
import org.sharingfood.entity.UserStatus;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.DonationAcceptanceRepository;
import org.sharingfood.repository.DonationRepository;
import org.sharingfood.repository.OrganizationMemberRepository;
import org.sharingfood.repository.OrganizationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final DonationRepository donationRepository;
    private final DonationAcceptanceRepository acceptanceRepository;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            DonationRepository donationRepository,
            DonationAcceptanceRepository acceptanceRepository) {
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.donationRepository = donationRepository;
        this.acceptanceRepository = acceptanceRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganizationDirectoryDto> searchDirectory(String query, String city, String typeFilter) {
        List<Organization> orgs;
        String q = (query != null && !query.trim().isEmpty()) ? query.trim().toLowerCase() : null;
        String c = (city != null && !city.trim().isEmpty()) ? city.trim().toLowerCase() : null;

        if (q == null && c == null) {
            orgs = organizationRepository.findByIsActiveTrue();
        } else {
            orgs = organizationRepository.findByIsActiveTrue().stream()
                    .filter(o -> {
                        boolean matchesQuery = true;
                        if (q != null) {
                            String name = o.getName() != null ? o.getName().toLowerCase() : "";
                            String desc = o.getDescription() != null ? o.getDescription().toLowerCase() : "";
                            matchesQuery = name.contains(q) || desc.contains(q);
                        }
                        boolean matchesCity = true;
                        if (c != null) {
                            String orgCity = (o.getAddress() != null && o.getAddress().getCity() != null)
                                    ? o.getAddress().getCity().toLowerCase() : "";
                            matchesCity = orgCity.equalsIgnoreCase(c);
                        }
                        return matchesQuery && matchesCity;
                    })
                    .collect(Collectors.toList());
        }

        // Only display organizations whose associated user is active and non-deleted
        orgs = orgs.stream()
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

        if ("BENEFICIARY".equals(typeFilter)) {
            orgs = orgs.stream().filter(o -> !o.getType().name().equals("RESTAURANT") && !o.getType().name().equals("BAKERY") && !o.getType().name().equals("CATERER") && !o.getType().name().equals("CORPORATE_CAFETERIA")).collect(Collectors.toList());
        } else if ("SUPPLIER".equals(typeFilter)) {
            orgs = orgs.stream().filter(o -> o.getType().name().equals("RESTAURANT") || o.getType().name().equals("BAKERY") || o.getType().name().equals("CATERER") || o.getType().name().equals("CORPORATE_CAFETERIA")).collect(Collectors.toList());
        }

        return orgs.stream()
                .map(this::toDirectoryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrganizationDirectoryDto getDirectoryDetails(UUID orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found: " + orgId));
        return toDirectoryDto(org);
    }

    private OrganizationDirectoryDto toDirectoryDto(Organization org) {
        OrganizationDirectoryDto dto = new OrganizationDirectoryDto();
        dto.setId(org.getId());
        dto.setName(org.getName());
        dto.setType(org.getType());
        dto.setDescription(org.getDescription());
        dto.setLogoUrl(org.getLogoUrl());
        dto.setPhotoUrl(org.getPhotoUrl() != null ? org.getPhotoUrl() : org.getLogoUrl());
        dto.setCreatedAt(org.getCreatedAt());

        String phone = null;
        if (org.getPublicPhone() != null && !org.getPublicPhone().trim().isEmpty()) {
            phone = org.getPublicPhone().trim();
        } else if (org.getContactPhone() != null && !org.getContactPhone().trim().isEmpty()) {
            phone = org.getContactPhone().trim();
        }

        if (org.isShowPublicPhone() && phone != null) {
            dto.setContactPhone(phone);
            dto.setPublicPhone(phone);
            dto.setShowContactPhone(true);
            dto.setShowPublicPhone(true);
        } else {
            dto.setShowContactPhone(false);
            dto.setShowPublicPhone(false);
        }

        if (org.getAddress() != null) {
            dto.setCity(org.getAddress().getCity());
            dto.setLocality(org.getAddress().getAreaLocality());
            dto.setStreetAddress(org.getAddress().getStreetAddress());
            dto.setLatitude(org.getAddress().getLatitude());
            dto.setLongitude(org.getAddress().getLongitude());
        }

        // Calculate impact statistics without exposing private records
        List<Donation> supplierDonations = donationRepository.findBySupplierIdOrderByCreatedAtDesc(org.getId());
        long completedSupplierDonations = supplierDonations.stream()
                .filter(d -> d.getStatus() == DonationStatus.COMPLETED)
                .count();

        long mealsSupplied = supplierDonations.stream()
                .filter(d -> d.getStatus() == DonationStatus.COMPLETED)
                .mapToLong(Donation::getEstimatedServings)
                .sum();

        List<Donation> beneficiaryDonations = donationRepository.findByBeneficiaryId(org.getId());
        long completedBeneficiaryDonations = beneficiaryDonations.stream()
                .filter(d -> d.getStatus() == DonationStatus.COMPLETED)
                .count();

        long mealsReceived = beneficiaryDonations.stream()
                .filter(d -> d.getStatus() == DonationStatus.COMPLETED)
                .mapToLong(Donation::getEstimatedServings)
                .sum();

        dto.setTotalDonationsOrReceived(completedSupplierDonations + completedBeneficiaryDonations);
        dto.setEstimatedMealsSharedOrReceived(mealsSupplied + mealsReceived);

        return dto;
    }
}
