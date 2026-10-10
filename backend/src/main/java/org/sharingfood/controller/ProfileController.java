package org.sharingfood.controller;

import org.sharingfood.dto.UpdateProfileRequest;
import org.sharingfood.dto.UserDto;
import org.sharingfood.security.UserPrincipal;
import org.sharingfood.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserDto> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getUserDto(currentUser.getId()));
    }

    @PatchMapping
    public ResponseEntity<UserDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody UpdateProfileRequest request) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.updateProfile(currentUser.getId(), request));
    }
}
