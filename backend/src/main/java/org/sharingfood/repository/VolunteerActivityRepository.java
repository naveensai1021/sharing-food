package org.sharingfood.repository;

import org.sharingfood.entity.VolunteerActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VolunteerActivityRepository extends JpaRepository<VolunteerActivity, UUID> {
    List<VolunteerActivity> findByVolunteerUserIdOrderByActivityDateDesc(UUID volunteerUserId);
}
