package org.sharingfood;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.sharingfood.dto.LoginRequest;
import org.sharingfood.dto.RegisterRequest;
import org.sharingfood.entity.*;
import org.sharingfood.repository.RoleRepository;
import org.sharingfood.repository.UserRepository;
import org.sharingfood.repository.VolunteerProfileRepository;
import org.sharingfood.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
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
    private VolunteerProfileRepository volunteerProfileRepository;

    @Autowired
    private VolunteerService volunteerService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));
        Role supplierRole = roleRepository.findByName("ROLE_SUPPLIER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_SUPPLIER")));
        Role beneficiaryRole = roleRepository.findByName("ROLE_BENEFICIARY")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_BENEFICIARY")));
        Role volunteerRole = roleRepository.findByName("ROLE_VOLUNTEER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_VOLUNTEER")));

        if (!userRepository.existsByEmailIgnoreCase("admin@sharingfood.org")) {
            adminUser = new User("admin@sharingfood.org", passwordEncoder.encode("Admin@123"), UserStatus.ACTIVE);
            adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
            adminUser = userRepository.save(adminUser);
        } else {
            adminUser = userRepository.findByEmailIgnoreCase("admin@sharingfood.org").get();
        }

        if (!volunteerProfileRepository.findByVolunteerCode("VOL-TEST-ONBOARDER").isPresent()) {
            User testVolUser = new User("vol_setup_" + System.currentTimeMillis() + "@sharingfood.org", passwordEncoder.encode("SecretPass123!"), UserStatus.ACTIVE);
            testVolUser.setRoles(new HashSet<>(Collections.singletonList(volunteerRole)));
            testVolUser = userRepository.save(testVolUser);
            VolunteerProfile vp = new VolunteerProfile(testVolUser, "https://example.com/photo.jpg", "https://example.com/id.jpg", "Hyderabad", "Banjara Hills", "Outreach");
            vp.setVolunteerCode("VOL-TEST-ONBOARDER");
            vp.setVerificationStatus(VerificationStatus.ACTIVE);
            volunteerProfileRepository.save(vp);
        }
    }

    @Test
    void testSupplierRegistration_DirectlyActive() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("supplier_test_" + System.currentTimeMillis() + "@test.org");
        request.setPassword("SecretPass123!");
        request.setRole("SUPPLIER");
        request.setFullName("Paradise Caterers");
        request.setOrganizationName("Paradise Catering Service");
        request.setOrganizationType("CATERER");
        request.setCity("Hyderabad");
        request.setLatitude(new BigDecimal("17.3850"));
        request.setLongitude(new BigDecimal("78.4867"));
        request.setVolunteerIdCode("VOL-TEST-ONBOARDER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.organizationName").value("Paradise Catering Service"));
    }

    @Test
    void testSupplierRegistration_WithoutVolunteerId_Fails() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("supplier_fail_" + System.currentTimeMillis() + "@test.org");
        request.setPassword("SecretPass123!");
        request.setRole("SUPPLIER");
        request.setFullName("Paradise Caterers");
        request.setOrganizationName("Paradise Catering Service");
        request.setCity("Hyderabad");
        // No volunteer ID provided

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testVolunteerRegistration_EntersPendingVerification_AndAttributionWorks() throws Exception {
        // 1. Volunteer registers
        RegisterRequest volRequest = new RegisterRequest();
        String volEmail = "vol_test_" + System.currentTimeMillis() + "@test.org";
        volRequest.setEmail(volEmail);
        volRequest.setPassword("SecretPass123!");
        volRequest.setRole("VOLUNTEER");
        volRequest.setFullName("Ananya Rao");
        volRequest.setCity("Hyderabad");
        volRequest.setProfilePhotoUrl("https://example.com/photo.jpg");
        volRequest.setIdProofUrl("https://example.com/id.jpg");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(volRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.volunteerVerificationStatus").value("PENDING_VERIFICATION"));

        User volunteerUser = userRepository.findByEmailIgnoreCase(volEmail).orElseThrow();
        VolunteerProfile vp = volunteerProfileRepository.findByUserId(volunteerUser.getId()).orElseThrow();
        assertEquals(VerificationStatus.PENDING_VERIFICATION, vp.getVerificationStatus());
        assertNull(vp.getVolunteerCode());

        // 2. Admin approves volunteer -> receives unique ID
        VolunteerProfile approved = volunteerService.approveVolunteer(volunteerUser.getId(), adminUser.getId());
        assertNotNull(approved.getVolunteerCode());
        assertTrue(approved.getVolunteerCode().startsWith("VOL-"));
        assertEquals(VerificationStatus.ACTIVE, approved.getVerificationStatus());

        // 3. New Supplier registers using verified Volunteer ID -> attribution credited
        RegisterRequest supRequest = new RegisterRequest();
        supRequest.setEmail("supplier_attributed_" + System.currentTimeMillis() + "@test.org");
        supRequest.setPassword("SecretPass123!");
        supRequest.setRole("SUPPLIER");
        supRequest.setFullName("Bawarchi Restaurant");
        supRequest.setOrganizationName("Bawarchi Restaurant");
        supRequest.setCity("Hyderabad");
        supRequest.setVolunteerIdCode(approved.getVolunteerCode());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(supRequest)))
                .andExpect(status().isOk());

        // Verify volunteer count increased
        VolunteerProfile updatedVp = volunteerProfileRepository.findByUserId(volunteerUser.getId()).orElseThrow();
        assertEquals(1, updatedVp.getOrganizationsOnboardedCount());
    }

    @Test
    void testSupplierRegistration_WithInvalidVolunteerId_Fails() throws Exception {
        RegisterRequest supRequest = new RegisterRequest();
        supRequest.setEmail("fail_supplier_" + System.currentTimeMillis() + "@test.org");
        supRequest.setPassword("SecretPass123!");
        supRequest.setRole("SUPPLIER");
        supRequest.setFullName("Fake Onboarded Supplier");
        supRequest.setOrganizationName("Fake Organization");
        supRequest.setCity("Hyderabad");
        supRequest.setVolunteerIdCode("VOL-INVALID-99999");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(supRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSuspendedUser_CannotLogin() throws Exception {
        User user = new User("suspended_" + System.currentTimeMillis() + "@test.org", passwordEncoder.encode("Pass123!"), UserStatus.SUSPENDED);
        Role role = roleRepository.findByName("ROLE_SUPPLIER").get();
        user.setRoles(new HashSet<>(Collections.singletonList(role)));
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest(user.getEmail(), "Pass123!");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isForbidden());
    }
}
