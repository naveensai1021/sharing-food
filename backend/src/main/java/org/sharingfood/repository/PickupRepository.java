package org.sharingfood.repository;

import org.sharingfood.entity.Pickup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PickupRepository extends JpaRepository<Pickup, UUID> {
    Optional<Pickup> findByDonationId(UUID donationId);
    Optional<Pickup> findByAcceptanceId(UUID acceptanceId);
}
