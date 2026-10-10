package org.sharingfood.repository;

import org.sharingfood.entity.Organization;
import org.sharingfood.entity.OrganizationMember;
import org.sharingfood.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, UUID> {
    Optional<OrganizationMember> findByUser(User user);
    Optional<OrganizationMember> findByUserId(UUID userId);
    List<OrganizationMember> findByOrganization(Organization organization);
    List<OrganizationMember> findByOrganizationId(UUID organizationId);
}
