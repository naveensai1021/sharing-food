package org.sharingfood.controller;

import org.sharingfood.dto.*;
import org.sharingfood.entity.VolunteerProfile;
import org.sharingfood.security.UserPrincipal;
import org.sharingfood.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/volunteers/pending")
    public ResponseEntity<List<AdminVolunteerVerificationDto>> getPendingVolunteers() {
        return ResponseEntity.ok(adminService.getPendingVolunteers());
    }

    @PostMapping("/volunteers/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveVolunteer(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        VolunteerProfile profile = adminService.approveVolunteer(id, adminUser.getId());
        return ResponseEntity.ok(Map.of(
                "message", "Volunteer approved successfully",
                "volunteerCode", profile.getVolunteerCode(),
                "status", profile.getVerificationStatus().name()
        ));
    }

    @PostMapping("/volunteers/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectVolunteer(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        String reason = payload != null ? payload.get("reason") : "Incomplete or unverifiable documents";
        VolunteerProfile profile = adminService.rejectVolunteer(id, adminUser.getId(), reason);
        return ResponseEntity.ok(Map.of(
                "message", "Volunteer verification rejected",
                "status", profile.getVerificationStatus().name()
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<AdminUserDto> suspendUser(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        String reason = payload != null ? payload.get("reason") : "Policy violation";
        return ResponseEntity.ok(adminService.suspendUser(id, adminUser.getId(), reason));
    }

    @PostMapping("/users/{id}/reactivate")
    public ResponseEntity<AdminUserDto> reactivateUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        return ResponseEntity.ok(adminService.reactivateUser(id, adminUser.getId()));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        adminService.deleteUser(id, adminUser.getId());
        return ResponseEntity.ok(Map.of("message", "User account deleted successfully"));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<AdminReportDto>> getReports() {
        return ResponseEntity.ok(adminService.getReports());
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<AdminReportDto> resolveReport(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        String notes = payload != null ? payload.get("notes") : "Resolved after investigation";
        return ResponseEntity.ok(adminService.resolveReport(id, adminUser.getId(), notes));
    }

    @PatchMapping("/reports/{id}/dismiss")
    public ResponseEntity<AdminReportDto> dismissReport(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        String notes = payload != null ? payload.get("notes") : "Dismissed as false report";
        return ResponseEntity.ok(adminService.dismissReport(id, adminUser.getId(), notes));
    }
}
