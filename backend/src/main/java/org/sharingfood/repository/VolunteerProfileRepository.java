package org.sharingfood.repository;

import org.sharingfood.entity.VerificationStatus;
import org.sharingfood.entity.VolunteerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VolunteerProfileRepository extends JpaRepository<VolunteerProfile, UUID> {
    Optional<VolunteerProfile> findByVolunteerCode(String volunteerCode);
    Optional<VolunteerProfile> findByUserId(UUID userId);
    List<VolunteerProfile> findByVerificationStatus(VerificationStatus status);
    boolean existsByVolunteerCode(String volunteerCode);
}
