package org.sharingfood.controller;

import jakarta.validation.Valid;
import org.sharingfood.dto.*;
import org.sharingfood.entity.VolunteerProfile;
import org.sharingfood.security.UserPrincipal;
import org.sharingfood.service.VolunteerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/volunteer")
public class VolunteerController {

    private final VolunteerService volunteerService;

    public VolunteerController(VolunteerService volunteerService) {
        this.volunteerService = volunteerService;
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<Map<String, Object>> validateVolunteerCode(@PathVariable String code) {
        Optional<VolunteerProfile> profileOpt = volunteerService.validateActiveVolunteer(code);
        if (profileOpt.isPresent()) {
            VolunteerProfile profile = profileOpt.get();
            String name = profile.getUser().getUserProfile() != null ? profile.getUser().getUserProfile().getFullName() : "Verified Volunteer";
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "volunteerCode", profile.getVolunteerCode(),
                "volunteerName", name
            ));
        } else {
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<VolunteerDashboardDto> getDashboard(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(volunteerService.getDashboard(user.getId()));
    }

    @GetMapping("/leads")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<List<VolunteerLeadDto>> getLeads(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(volunteerService.getLeads(user.getId()));
    }

    @PostMapping("/leads")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<VolunteerLeadDto> createLead(
            @Valid @RequestBody CreateVolunteerLeadRequest req,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(volunteerService.createLead(req, user.getId()));
    }

    @PatchMapping("/leads/{id}/status")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<VolunteerLeadDto> updateLeadStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        String status = payload.get("status");
        String notes = payload.get("notes");
        return ResponseEntity.ok(volunteerService.updateLeadStatus(id, status, notes, user.getId()));
    }

    @GetMapping("/activities")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<List<VolunteerActivityDto>> getActivities(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(volunteerService.getActivities(user.getId()));
    }

    @PostMapping("/activities")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<VolunteerActivityDto> logActivity(
            @Valid @RequestBody CreateVolunteerActivityRequest req,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(volunteerService.createActivity(req, user.getId()));
    }
}
