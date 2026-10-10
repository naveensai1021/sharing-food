package org.sharingfood.repository;

import org.sharingfood.entity.User;
import org.sharingfood.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByUser(User user);
    Optional<UserProfile> findByUserId(UUID userId);
}
