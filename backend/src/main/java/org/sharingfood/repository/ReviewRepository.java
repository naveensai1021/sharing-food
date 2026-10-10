package org.sharingfood.repository;

import org.sharingfood.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByRevieweeOrganizationIdOrderByCreatedAtDesc(UUID organizationId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.revieweeOrganization.id = :orgId")
    Double getAverageRatingForOrganization(@Param("orgId") UUID orgId);
    
    long countByRevieweeOrganizationId(UUID organizationId);
}
