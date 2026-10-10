package org.sharingfood.controller;

import org.sharingfood.dto.OrganizationDirectoryDto;
import org.sharingfood.service.OrganizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping("/directory/public")
    public ResponseEntity<List<OrganizationDirectoryDto>> getPublicDirectory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(organizationService.searchDirectory(search, city, "BENEFICIARY"));
    }

    @GetMapping("/directory/suppliers")
    public ResponseEntity<List<OrganizationDirectoryDto>> getSuppliersDirectory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(organizationService.searchDirectory(search, city, "SUPPLIER"));
    }

    @GetMapping("/directory")
    public ResponseEntity<List<OrganizationDirectoryDto>> getDirectory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city) {
        // Fallback for current frontend calling /directory.
        // If we want to support the frontend's request as it is, we just return ALL here.
        // But the requirement says to split them.
        return ResponseEntity.ok(organizationService.searchDirectory(search, city, "ALL"));
    }

    @GetMapping("/directory/{id}")
    public ResponseEntity<OrganizationDirectoryDto> getOrganizationDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(organizationService.getDirectoryDetails(id));
    }
}
