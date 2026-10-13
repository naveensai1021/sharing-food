package org.sharingfood.controller;

import org.sharingfood.dto.PlatformImpactDto;
import org.sharingfood.service.ImpactService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/impact")
public class ImpactController {

    private final ImpactService impactService;

    public ImpactController(ImpactService impactService) {
        this.impactService = impactService;
    }

    @GetMapping("/stats")
    public ResponseEntity<PlatformImpactDto> getImpactStats() {
        return ResponseEntity.ok(impactService.getPlatformImpact());
    }
}
