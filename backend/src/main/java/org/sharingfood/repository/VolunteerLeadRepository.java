package org.sharingfood.repository;

import org.sharingfood.entity.VolunteerLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VolunteerLeadRepository extends JpaRepository<VolunteerLead, UUID> {
    List<VolunteerLead> findByVolunteerUserIdOrderByCreatedAtDesc(UUID volunteerUserId);
}
