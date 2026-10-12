package org.sharingfood;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.sharingfood.dto.CreateDonationRequest;
import org.sharingfood.dto.LoginRequest;
import org.sharingfood.dto.RegisterRequest;
import org.sharingfood.dto.VerifyEmailRequest;
import org.sharingfood.entity.*;
import org.sharingfood.repository.RoleRepository;
import org.sharingfood.repository.UserRepository;
import org.sharingfood.security.JwtTokenProvider;
import org.sharingfood.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthAndVolunteerAttributionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User adminUser;

    private String sha256Hex(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));
        roleRepository.findByName("ROLE_SUPPLIER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_SUPPLIER")));
        roleRepository.findByName("ROLE_BENEFICIARY")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_BENEFICIARY")));

        if (!userRepository.existsByEmailIgnoreCase("admin@sharingfood.org")) {
            adminUser = new User("admin@sharingfood.org", passwordEncoder.encode("Admin@123"), UserStatus.APPROVED);
            adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
            adminUser = userRepository.save(adminUser);
        } else {
            adminUser = userRepository.findByEmailIgnoreCase("admin@sharingfood.org").get();
        }
    }

    @Test
    void testSupplierRegistration_DefaultsToPendingOtpVerification() throws Exception {
        RegisterRequest request = new RegisterRequest();
        String email = "supplier_test_" + System.currentTimeMillis() + "@test.org";
        request.setEmail(email);
        request.setPassword("SecretPass123!");
        request.setRole("SUPPLIER");
        request.setFullName("Paradise Caterers");
        request.setPhone("+919876543210");
        request.setOrganizationName("Paradise Catering Service");
        request.setOrganizationType("CATERER");
        request.setCity("Hyderabad");
        request.setPhotoUrl("https://example.com/storefront.jpg");
        request.setLicenseNumber("FSSAI-12345");
        request.setLatitude(new BigDecimal("17.3850"));
        request.setLongitude(new BigDecimal("78.4867"));
        request.setVerificationMethod("EMAIL");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_OTP_VERIFICATION"))
                .andExpect(jsonPath("$.organizationName").value("Paradise Catering Service"));

        User saved = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(UserStatus.PENDING_OTP_VERIFICATION, saved.getStatus());
        assertNotNull(saved.getEmailVerificationToken(), "OTP hash must be generated");
        assertNotNull(saved.getEmailVerificationExpiresAt(), "OTP expiration must be set");
    }

    @Test
    void testBeneficiaryRegistration_DefaultsToPendingOtpVerification() throws Exception {
        RegisterRequest request = new RegisterRequest();
        String email = "beneficiary_test_" + System.currentTimeMillis() + "@test.org";
        request.setEmail(email);
        request.setPassword("SecretPass123!");
        request.setRole("BENEFICIARY");
        request.setFullName("Sister Rita");
        request.setPhone("+919876543211");
        request.setOrganizationName("Aasha Care Home");
        request.setOrganizationType("ORPHANAGE");
        request.setCity("Hyderabad");
        request.setPhotoUrl("https://example.com/home.jpg");
        request.setResidentCount(45);
        request.setVerificationMethod("SMS");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_OTP_VERIFICATION"));

        User saved = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(UserStatus.PENDING_OTP_VERIFICATION, saved.getStatus());
        assertEquals("SMS", saved.getVerificationMethod());
    }

    @Test
    void testSignupRetry_AllowsReRegistrationWhenUnverified() throws Exception {
        String email = "retry_test_" + System.currentTimeMillis() + "@test.org";
        String phone = "+919876500001";

        RegisterRequest req1 = new RegisterRequest();
        req1.setEmail(email);
        req1.setPassword("InitialPass123!");
        req1.setRole("SUPPLIER");
        req1.setFullName("Initial Vendor");
        req1.setPhone(phone);
        req1.setOrganizationName("Initial Food Hub");
        req1.setPhotoUrl("https://example.com/store1.jpg");

        // 1st Registration attempt
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_OTP_VERIFICATION"));

        User userAfterReq1 = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        String token1 = userAfterReq1.getEmailVerificationToken();

        // 2nd Registration attempt (Signup retry with same email and phone)
        RegisterRequest req2 = new RegisterRequest();
        req2.setEmail(email);
        req2.setPassword("NewSecretPass456!");
        req2.setRole("SUPPLIER");
        req2.setFullName("Updated Vendor");
        req2.setPhone(phone);
        req2.setOrganizationName("Updated Food Hub");
        req2.setPhotoUrl("https://example.com/store2.jpg");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_OTP_VERIFICATION"))
                .andExpect(jsonPath("$.fullName").value("Updated Vendor"));

        User userAfterReq2 = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(userAfterReq1.getId(), userAfterReq2.getId(), "Must reuse existing unverified record");
        assertTrue(passwordEncoder.matches("NewSecretPass456!", userAfterReq2.getPasswordHash()), "Password must be updated");
    }

    @Test
    void testOtpVerification_TransitionsToPendingAdminApproval_AndBlocksDuplicates() throws Exception {
        String email = "verify_test_" + System.currentTimeMillis() + "@test.org";
        String otp = "123456";

        RegisterRequest regReq = new RegisterRequest();
        regReq.setEmail(email);
        regReq.setPassword("SecretPass123!");
        regReq.setRole("SUPPLIER");
        regReq.setFullName("Verified Caterers");
        regReq.setPhone("+919876599999");
        regReq.setOrganizationName("Verified Caterers Hub");
        regReq.setPhotoUrl("https://example.com/caterer.jpg");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isOk());

        // Update user to known OTP hash for deterministic verification testing
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        user.setEmailVerificationToken(sha256Hex(otp));
        user.setEmailVerificationExpiresAt(Instant.now().plus(5, ChronoUnit.MINUTES));
        userRepository.save(user);

        // Verify OTP via /api/auth/verify-otp
        VerifyEmailRequest verifyReq = new VerifyEmailRequest(email, otp);
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_ADMIN_APPROVAL"));

        User verifiedUser = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(UserStatus.PENDING_ADMIN_APPROVAL, verifiedUser.getStatus());
        assertTrue(verifiedUser.isEmailVerified());
        assertNull(verifiedUser.getEmailVerificationToken());

        // Now that account is OTP-verified, duplicate registration must be blocked
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testVolunteerRegistration_RejectedAsInvalidRole() throws Exception {
        RegisterRequest volRequest = new RegisterRequest();
        volRequest.setEmail("vol_test_" + System.currentTimeMillis() + "@test.org");
        volRequest.setPassword("SecretPass123!");
        volRequest.setRole("VOLUNTEER");
        volRequest.setFullName("Ananya Rao");
        volRequest.setCity("Hyderabad");

        // VOLUNTEER role is completely removed; public registration only accepts SUPPLIER or BENEFICIARY
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(volRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUnapprovedUser_CannotLogin() throws Exception {
        Role supplierRole = roleRepository.findByName("ROLE_SUPPLIER").get();
        String email = "unapproved_login_" + System.currentTimeMillis() + "@test.org";
        User pendUser = new User(email, passwordEncoder.encode("SecretPass123!"), UserStatus.PENDING_ADMIN_APPROVAL);
        pendUser.getRoles().add(supplierRole);
        userRepository.save(pendUser);

        LoginRequest loginRequest = new LoginRequest(email, "SecretPass123!");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testApprovedSupplier_CanLogin() throws Exception {
        Role supplierRole = roleRepository.findByName("ROLE_SUPPLIER").get();
        String email = "approved_login_" + System.currentTimeMillis() + "@test.org";
        User approvedUser = new User(email, passwordEncoder.encode("SecretPass123!"), UserStatus.APPROVED);
        approvedUser.getRoles().add(supplierRole);
        userRepository.save(approvedUser);

        LoginRequest loginRequest = new LoginRequest(email, "SecretPass123!");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.status").value("APPROVED"));
    }
}
