package org.sharingfood.repository;

import org.sharingfood.entity.BeneficiaryDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BeneficiaryDetailsRepository extends JpaRepository<BeneficiaryDetails, UUID> {
}
