package org.sharingfood;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.sharingfood.dto.*;
import org.sharingfood.entity.User;
import org.sharingfood.entity.UserStatus;
import org.sharingfood.exception.BadRequestException;
import org.sharingfood.repository.UserRepository;
import org.sharingfood.service.AdminService;
import org.sharingfood.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@Transactional
public class OtpVerificationWorkflowTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    private RegisterRequest createSupplierRequest(String email, String phone, String method) {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Green Harvest Foods");
        req.setEmail(email);
        req.setPassword("Password@123");
        req.setPhone(phone);
        req.setRole("SUPPLIER");
        req.setOrganizationType("RESTAURANT");
        req.setOrganizationName("Green Harvest Kitchen");
        req.setPhotoUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5");
        req.setStreetAddress("123 Food Street");
        req.setCity("Hyderabad");
        req.setLatitude(new BigDecimal("17.385044"));
        req.setLongitude(new BigDecimal("78.486671"));
        req.setVerificationMethod(method);
        req.setLicenseNumber("FSSAI-12345678");
        return req;
    }

    private RegisterRequest createBeneficiaryRequest(String email, String phone, String method) {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Hope Care Shelter");
        req.setEmail(email);
        req.setPassword("Password@123");
        req.setPhone(phone);
        req.setRole("BENEFICIARY");
        req.setOrganizationType("SHELTER");
        req.setOrganizationName("Hope Care Orphanage");
        req.setPhotoUrl("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c");
        req.setStreetAddress("456 Care Lane");
        req.setCity("Hyderabad");
        req.setLatitude(new BigDecimal("17.412345"));
        req.setLongitude(new BigDecimal("78.432109"));
        req.setVerificationMethod(method);
        req.setLicenseNumber("NGO-REG-9876");
        req.setResidentCount(40);
        req.setFoodCapacityServings(50);
        req.setDietaryPreferences("Vegetarian");
        return req;
    }

    @Test
    void testSupplierEmailOtpRegistrationAndVerification() {
        String email = "supplier.test.flow@example.com";
        RegisterRequest req = createSupplierRequest(email, "9876543211", "EMAIL");

        AuthResponse resp = authService.register(req);
        assertNotNull(resp.getUser());
        assertEquals(UserStatus.PENDING_OTP_VERIFICATION, resp.getUser().getStatus());

        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals("EMAIL", user.getVerificationMethod());
        assertFalse(user.isEmailVerified());
        assertNotNull(user.getEmailVerificationToken());

        // Incorrect OTP should fail with attempt counter
        VerifyEmailRequest invalidReq = new VerifyEmailRequest(email, "000000");
        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.verifyEmail(invalidReq));
        assertTrue(ex.getMessage().contains("attempt(s) remaining"));

        // Retest with the simulated token: update token to known test hash
        user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(1, user.getVerificationAttempts());

        // Test with invalid code until 5 attempts
        for (int i = 2; i <= 5; i++) {
            assertThrows(BadRequestException.class, () -> authService.verifyEmail(invalidReq));
        }

        user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(5, user.getVerificationAttempts());

        // Now 6th attempt should block
        BadRequestException blockedEx = assertThrows(BadRequestException.class, () -> authService.verifyEmail(invalidReq));
        assertTrue(blockedEx.getMessage().contains("Maximum verification attempts exceeded"));
    }

    @Test
    void testSignupRetryWithSameDetailsAllowed() {
        String email = "retry.user@example.com";
        RegisterRequest req1 = createSupplierRequest(email, "9876543222", "EMAIL");

        // 1st Registration attempt
        authService.register(req1);
        User user1 = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(UserStatus.PENDING_OTP_VERIFICATION, user1.getStatus());

        // Simulate time passing (5 minutes expired)
        user1.setEmailVerificationExpiresAt(Instant.now().minus(1, ChronoUnit.MINUTES));
        userRepository.save(user1);

        // User registers AGAIN with the exact same email, phone, and org details
        RegisterRequest req2 = createSupplierRequest(email, "9876543222", "EMAIL");
        req2.setFullName("Updated Supplier Name");
        assertDoesNotThrow(() -> authService.register(req2));

        User user2 = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(user1.getId(), user2.getId(), "Should safely reuse existing unverified record");
        assertTrue(user2.getEmailVerificationExpiresAt().isAfter(Instant.now()), "Expiry reset to 5 minutes");
        assertEquals(0, user2.getVerificationAttempts());
    }

    @Test
    void testChangeVerificationMethodFromEmailToSms() {
        String email = "switch.method@example.com";
        RegisterRequest req = createBeneficiaryRequest(email, "9876543233", "EMAIL");
        authService.register(req);

        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals("EMAIL", user.getVerificationMethod());

        // User switches from EMAIL to SMS
        ChangeVerificationMethodRequest switchReq = new ChangeVerificationMethodRequest(email, "9876543233", "SMS");
        RegistrationStatusResponse status = authService.changeVerificationMethod(switchReq);

        assertEquals("SMS", status.getVerificationMethod());
        User updated = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals("SMS", updated.getVerificationMethod());
        assertNotNull(updated.getEmailVerificationToken());
        assertTrue(updated.getEmailVerificationExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void testUnverifiedAccountsExcludedFromAdminQueue() {
        String email = "unverified.admin.check@example.com";
        RegisterRequest req = createSupplierRequest(email, "9876543244", "EMAIL");
        authService.register(req);

        List<AdminUserDto> adminUsers = adminService.getAllUsers();
        boolean foundInAdminQueue = adminUsers.stream().anyMatch(u -> email.equalsIgnoreCase(u.getEmail()));
        assertFalse(foundInAdminQueue, "Unverified registrations must NEVER appear in the Admin approval queue!");
    }
}
