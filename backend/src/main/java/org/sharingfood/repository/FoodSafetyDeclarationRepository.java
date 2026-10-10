package org.sharingfood.repository;

import org.sharingfood.entity.FoodSafetyDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FoodSafetyDeclarationRepository extends JpaRepository<FoodSafetyDeclaration, UUID> {
    Optional<FoodSafetyDeclaration> findByDonationId(UUID donationId);
}
