package org.sharingfood.service;

import org.sharingfood.dto.UpdateProfileRequest;
import org.sharingfood.dto.UserDto;
import org.sharingfood.entity.*;
import org.sharingfood.exception.ResourceNotFoundException;
import org.sharingfood.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final OrganizationRepository organizationRepository;
    private final AddressRepository addressRepository;
    private final AuditService auditService;

    public UserService(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            OrganizationMemberRepository organizationMemberRepository,
            OrganizationRepository organizationRepository,
            AddressRepository addressRepository,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.organizationRepository = organizationRepository;
        this.addressRepository = addressRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public UserDto getUserDto(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return toDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toDto(user);
    }

    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        UserProfile profile = userProfileRepository.findByUser(user).orElseGet(() -> {
            UserProfile p = new UserProfile();
            p.setUser(user);
            return p;
        });
        if (request.getFullName() != null) profile.setFullName(request.getFullName().trim());
        else if (request.getContactPerson() != null) profile.setFullName(request.getContactPerson().trim());
        if (request.getPhone() != null) profile.setPhone(request.getPhone().trim());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getCity() != null) profile.setCity(request.getCity().trim());
        userProfileRepository.save(profile);

        organizationMemberRepository.findByUser(user).ifPresent(member -> {
            Organization org = member.getOrganization();
            if (request.getOrganizationName() != null) org.setName(request.getOrganizationName().trim());
            if (request.getContactPerson() != null) org.setContactPerson(request.getContactPerson().trim());
            else if (request.getFullName() != null) org.setContactPerson(request.getFullName().trim());
            if (request.getDescription() != null) org.setDescription(request.getDescription().trim());
            if (request.getLogoUrl() != null) org.setLogoUrl(request.getLogoUrl());
            if (request.getPhotoUrl() != null) org.setPhotoUrl(request.getPhotoUrl());
            if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
                org.setContactPhone(request.getPhone().trim());
                if (org.getPublicPhone() == null || org.getPublicPhone().trim().isEmpty()) {
                    org.setPublicPhone(request.getPhone().trim());
                }
            }
            if (request.getPublicPhone() != null && !request.getPublicPhone().trim().isEmpty()) {
                org.setPublicPhone(request.getPublicPhone().trim());
                if (org.getContactPhone() == null || org.getContactPhone().trim().isEmpty()) {
                    org.setContactPhone(request.getPublicPhone().trim());
                }
            }
            if (request.getShowPublicPhone() != null) org.setShowPublicPhone(request.getShowPublicPhone());

            // Address & Location update
            if (request.getStreetAddress() != null || request.getCity() != null || request.getPostalCode() != null || request.getLatitude() != null) {
                Address addr = org.getAddress();
                if (addr == null) {
                    addr = new Address();
                    addr.setOrganization(org);
                    org.setAddress(addr);
                }
                if (request.getStreetAddress() != null) addr.setStreetAddress(request.getStreetAddress());
                if (request.getCity() != null) addr.setCity(request.getCity());
                if (request.getLocality() != null) addr.setAreaLocality(request.getLocality());
                if (request.getState() != null) addr.setState(request.getState());
                if (request.getPostalCode() != null) addr.setPostalCode(request.getPostalCode());
                if (request.getLatitude() != null) addr.setLatitude(request.getLatitude());
                if (request.getLongitude() != null) addr.setLongitude(request.getLongitude());
                addressRepository.save(addr);
            }

            organizationRepository.save(org);
        });

        auditService.log(userId, "UPDATE_PROFILE", "USER", userId, null, "User profile updated");
        return toDto(user);
    }

    @Transactional
    public void suspendUser(UUID userId, UUID adminUserId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setStatus(UserStatus.SUSPENDED);
        user.setStatusReason(reason);
        user.setReviewedByAdminId(adminUserId);
        user.setReviewedAt(Instant.now());
        userRepository.save(user);

        auditService.log(adminUserId, "SUSPEND_USER", "USER", userId, null, "Account suspended. Reason: " + reason);
    }

    @Transactional
    public void reactivateUser(UUID userId, UUID adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setStatus(UserStatus.APPROVED);
        user.setStatusReason(null);
        user.setReviewedByAdminId(adminUserId);
        user.setReviewedAt(Instant.now());
        userRepository.save(user);

        auditService.log(adminUserId, "REACTIVATE_USER", "USER", userId, null, "Account approved and reactivated");
    }

    @Transactional
    public void deleteUser(UUID userId, UUID adminUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setStatus(UserStatus.DELETED);
        user.setDeletedAt(Instant.now());
        userRepository.save(user);

        auditService.log(adminUserId, "DELETE_USER", "USER", userId, null, "Account soft-deleted");
    }

    public UserDto toDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setStatus(user.getStatus());
        dto.setStatusReason(user.getStatusReason());
        dto.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
        dto.setEmailVerified(user.isEmailVerified());

        userProfileRepository.findByUser(user).ifPresent(profile -> {
            dto.setFullName(profile.getFullName());
            dto.setPhone(profile.getPhone());
            dto.setAvatarUrl(profile.getAvatarUrl());
            dto.setCity(profile.getCity());
        });

        organizationMemberRepository.findByUser(user).ifPresent(member -> {
            Organization org = member.getOrganization();
            dto.setOrganizationId(org.getId());
            dto.setOrganizationName(org.getName());
            dto.setOrganizationType(org.getType());
            dto.setContactPerson(org.getContactPerson());
            dto.setShowPublicPhone(org.isShowPublicPhone());
            dto.setPhotoUrl(org.getPhotoUrl() != null ? org.getPhotoUrl() : org.getLogoUrl());
            dto.setPublicPhone(org.getPublicPhone() != null ? org.getPublicPhone() : org.getContactPhone());
            dto.setLicenseNumber(org.getLicenseNumber());
            dto.setDocumentUrl(org.getDocumentUrl());
            if (dto.getPhone() == null || dto.getPhone().isBlank()) {
                if (org.getContactPhone() != null && !org.getContactPhone().isBlank()) {
                    dto.setPhone(org.getContactPhone());
                } else if (org.getPublicPhone() != null && !org.getPublicPhone().isBlank()) {
                    dto.setPhone(org.getPublicPhone());
                }
            }
            if ((dto.getFullName() == null || dto.getFullName().isBlank()) && org.getContactPerson() != null) {
                dto.setFullName(org.getContactPerson());
            }
            if (org.getAddress() != null) {
                Address a = org.getAddress();
                dto.setStreetAddress(a.getStreetAddress());
                dto.setLocality(a.getAreaLocality());
                dto.setCity(a.getCity());
                dto.setState(a.getState());
                dto.setPostalCode(a.getPostalCode());
                dto.setLatitude(a.getLatitude());
                dto.setLongitude(a.getLongitude());
            }
        });

        return dto;
    }
}
