package org.sharingfood.repository;

import org.sharingfood.entity.InAppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InAppNotificationRepository extends JpaRepository<InAppNotification, UUID> {
    List<InAppNotification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<InAppNotification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId);
    long countByUserIdAndIsReadFalse(UUID userId);
}
