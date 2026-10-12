package org.sharingfood.repository;

import org.sharingfood.entity.RegistrationOtpChallenge;
import org.sharingfood.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationOtpChallengeRepository extends JpaRepository<RegistrationOtpChallenge, UUID> {
    
    List<RegistrationOtpChallenge> findByUserOrderByCreatedAtDesc(User user);

    Optional<RegistrationOtpChallenge> findFirstByUserAndConsumedAtIsNullOrderByCreatedAtDesc(User user);

    Optional<RegistrationOtpChallenge> findFirstByTargetContactAndConsumedAtIsNullOrderByCreatedAtDesc(String targetContact);
}
