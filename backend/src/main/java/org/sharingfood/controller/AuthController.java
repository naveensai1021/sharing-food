package org.sharingfood.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.sharingfood.dto.*;
import org.sharingfood.security.UserPrincipal;
import org.sharingfood.service.AuthService;
import org.sharingfood.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping({"/auth/register", "/auth/signup"})
    public ResponseEntity<UserDto> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        if (authResponse.getToken() != null) {
            setJwtCookie(response, authResponse.getToken(), 86400);
        }
        return ResponseEntity.ok(authResponse.getUser());
    }

    @PostMapping({"/auth/verify-email", "/auth/verify-otp", "/auth/otp/verify"})
    public ResponseEntity<UserDto> verifyOtp(
            @Valid @RequestBody VerifyEmailRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.verifyEmail(request);
        if (authResponse.getToken() != null) {
            setJwtCookie(response, authResponse.getToken(), 86400);
        }
        return ResponseEntity.ok(authResponse.getUser());
    }

    @PostMapping({"/auth/resend-verification", "/auth/resend-otp", "/auth/otp/resend", "/auth/otp/send"})
    public ResponseEntity<Map<String, String>> resendOtp(
            @Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request);
        return ResponseEntity.ok(Map.of("message", "A new 6-digit verification code has been dispatched."));
    }

    @PostMapping({"/auth/change-verification-method", "/auth/otp/change-method"})
    public ResponseEntity<RegistrationStatusResponse> changeVerificationMethod(
            @Valid @RequestBody ChangeVerificationMethodRequest request) {
        RegistrationStatusResponse response = authService.changeVerificationMethod(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth/registration-status")
    public ResponseEntity<RegistrationStatusResponse> getRegistrationStatus(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {
        RegistrationStatusResponse status = authService.getRegistrationStatus(email, phone);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        setJwtCookie(response, authResponse.getToken(), 86400);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping({"/auth/forgot-password", "/auth/password/forgot"})
    public ResponseEntity<Map<String, Object>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        Map<String, Object> result = authService.forgotPassword(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping({"/auth/reset-password", "/auth/password/reset"})
    public ResponseEntity<Map<String, String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        Map<String, String> result = authService.resetPassword(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        setJwtCookie(response, "", 0);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        UserDto dto = userService.getUserDto(currentUser.getId());
        return ResponseEntity.ok(dto);
    }

    private void setJwtCookie(HttpServletResponse response, String token, int maxAgeSeconds) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set true in production HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
    }
}
