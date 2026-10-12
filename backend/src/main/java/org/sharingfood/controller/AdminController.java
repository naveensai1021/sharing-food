package org.sharingfood.controller;

import org.sharingfood.dto.AdminDashboardDto;
import org.sharingfood.dto.AdminReportDto;
import org.sharingfood.dto.AdminUserDto;
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

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> getUserDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUserDetails(id));
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<AdminUserDto> approveUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        return ResponseEntity.ok(adminService.approveUser(id, adminUser.getId()));
    }

    @PostMapping("/users/{id}/reject")
    public ResponseEntity<AdminUserDto> rejectUser(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        String reason = payload != null ? payload.get("reason") : null;
        return ResponseEntity.ok(adminService.rejectUser(id, adminUser.getId(), reason));
    }

    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<AdminUserDto> suspendUser(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal adminUser
    ) {
        String reason = payload != null ? payload.get("reason") : null;
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
