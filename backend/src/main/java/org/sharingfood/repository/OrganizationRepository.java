package org.sharingfood.repository;

import org.sharingfood.entity.Organization;
import org.sharingfood.entity.OrganizationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
    List<Organization> findByIsActiveTrue();
    List<Organization> findByTypeAndIsActiveTrue(OrganizationType type);
    List<Organization> findByTypeInAndIsActiveTrue(List<OrganizationType> types);
    List<Organization> findByOnboardedByVolunteerId(UUID volunteerId);

    @Query("SELECT o FROM Organization o JOIN o.address a WHERE o.isActive = true AND " +
           "(:query IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(o.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:city IS NULL OR LOWER(a.city) = LOWER(:city))")
    List<Organization> searchDirectory(@Param("query") String query, @Param("city") String city);
}
