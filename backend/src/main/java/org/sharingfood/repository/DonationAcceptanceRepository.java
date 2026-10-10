package org.sharingfood.repository;

import org.sharingfood.entity.DonationAcceptance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DonationAcceptanceRepository extends JpaRepository<DonationAcceptance, UUID> {
    Optional<DonationAcceptance> findByDonationId(UUID donationId);
    List<DonationAcceptance> findByBeneficiaryId(UUID beneficiaryId);
}
