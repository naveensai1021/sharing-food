package org.sharingfood;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.sharingfood.dto.CreateDonationRequest;
import org.sharingfood.dto.LoginRequest;
import org.sharingfood.dto.RegisterRequest;
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
    void testSupplierRegistration_DefaultsToPendingApproval() throws Exception {
        RegisterRequest request = new RegisterRequest();
        String email = "supplier_test_" + System.currentTimeMillis() + "@test.org";
        request.setEmail(email);
        request.setPassword("SecretPass123!");
        request.setRole("SUPPLIER");
        request.setFullName("Paradise Caterers");
        request.setOrganizationName("Paradise Catering Service");
        request.setOrganizationType("CATERER");
        request.setCity("Hyderabad");
        request.setPhotoUrl("https://example.com/storefront.jpg");
        request.setLicenseNumber("FSSAI-12345");
        request.setLatitude(new BigDecimal("17.3850"));
        request.setLongitude(new BigDecimal("78.4867"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.organizationName").value("Paradise Catering Service"));

        User saved = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(UserStatus.PENDING_APPROVAL, saved.getStatus());
    }

    @Test
    void testBeneficiaryRegistration_DefaultsToPendingApproval() throws Exception {
        RegisterRequest request = new RegisterRequest();
        String email = "beneficiary_test_" + System.currentTimeMillis() + "@test.org";
        request.setEmail(email);
        request.setPassword("SecretPass123!");
        request.setRole("BENEFICIARY");
        request.setFullName("Sister Rita");
        request.setOrganizationName("Aasha Care Home");
        request.setOrganizationType("ORPHANAGE");
        request.setCity("Hyderabad");
        request.setPhotoUrl("https://example.com/home.jpg");
        request.setResidentCount(45);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_APPROVAL"));

        User saved = userRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertEquals(UserStatus.PENDING_APPROVAL, saved.getStatus());
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
    void testUnapprovedSupplier_CannotCreateDonation() throws Exception {
        Role supplierRole = roleRepository.findByName("ROLE_SUPPLIER").get();
        String email = "pending_sup_action_" + System.currentTimeMillis() + "@test.org";
        User pendUser = new User(email, passwordEncoder.encode("SecretPass123!"), UserStatus.PENDING_APPROVAL);
        pendUser.getRoles().add(supplierRole);
        pendUser = userRepository.save(pendUser);

        UserPrincipal principal = UserPrincipal.create(pendUser);
        String token = tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));

        CreateDonationRequest donationReq = new CreateDonationRequest();
        donationReq.setTitle("Surplus Rice Bowls");
        donationReq.setFoodCategory(FoodCategory.RICE);
        donationReq.setDietaryType(DietaryType.VEGETARIAN);
        donationReq.setEstimatedServings(30);
        donationReq.setApproximateQuantity(15.0);
        donationReq.setQuantityUnit("KG");
        donationReq.setPreparationTime(Instant.now().minus(1, ChronoUnit.HOURS));
        donationReq.setPickupAvailableFrom(Instant.now());
        donationReq.setPickupAvailableUntil(Instant.now().plus(4, ChronoUnit.HOURS));
        donationReq.setConsumeBeforeTime(Instant.now().plus(8, ChronoUnit.HOURS));
        donationReq.setSafetyDeclarationConfirmed(true);

        mockMvc.perform(post("/api/donations")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(donationReq)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testPendingUser_CanLoginAndCheckStatus() throws Exception {
        Role supplierRole = roleRepository.findByName("ROLE_SUPPLIER").get();
        String email = "login_pending_" + System.currentTimeMillis() + "@test.org";
        User pendUser = new User(email, passwordEncoder.encode("SecretPass123!"), UserStatus.PENDING_APPROVAL);
        pendUser.getRoles().add(supplierRole);
        userRepository.save(pendUser);

        LoginRequest loginRequest = new LoginRequest(email, "SecretPass123!");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.status").value("PENDING_APPROVAL"));
    }
}
