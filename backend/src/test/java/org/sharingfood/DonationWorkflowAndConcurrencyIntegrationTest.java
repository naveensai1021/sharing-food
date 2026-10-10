package org.sharingfood;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.sharingfood.dto.CreateDonationRequest;
import org.sharingfood.dto.DonationDto;
import org.sharingfood.entity.*;
import org.sharingfood.repository.*;
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
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.HashSet;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DonationWorkflowAndConcurrencyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User supplierUser;
    private String supplierToken;
    private Organization supplierOrg;

    private User beneficiaryAUser;
    private String beneficiaryAToken;
    private Organization beneficiaryAOrg;

    private User beneficiaryBUser;
    private String beneficiaryBToken;
    private Organization beneficiaryBOrg;

    @BeforeEach
    void setUp() {
        Role roleSupplier = roleRepository.findByName("ROLE_SUPPLIER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_SUPPLIER")));
        Role roleBeneficiary = roleRepository.findByName("ROLE_BENEFICIARY")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_BENEFICIARY")));

        long suffix = System.currentTimeMillis();

        // 1. Supplier Setup
        supplierUser = new User("supplier_wf_" + suffix + "@test.org", passwordEncoder.encode("Pass123!"), UserStatus.ACTIVE);
        supplierUser.setRoles(new HashSet<>(Collections.singletonList(roleSupplier)));
        supplierUser = userRepository.save(supplierUser);

        supplierOrg = new Organization("Paradise Biryani " + suffix, OrganizationType.RESTAURANT, "Restaurant", "Chef", "9999", "sup@test.org");
        supplierOrg.setAddress(new Address("Road 12", "Hyderabad", "TS", "500034", new BigDecimal("17.3850"), new BigDecimal("78.4867")));
        supplierOrg = organizationRepository.save(supplierOrg);
        organizationMemberRepository.save(new OrganizationMember(supplierOrg, supplierUser, "PRIMARY_CONTACT"));

        UserPrincipal supplierPrincipal = UserPrincipal.create(supplierUser);
        supplierToken = tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(supplierPrincipal, null, supplierPrincipal.getAuthorities()));

        // 2. Beneficiary A Setup
        beneficiaryAUser = new User("ben_a_" + suffix + "@test.org", passwordEncoder.encode("Pass123!"), UserStatus.ACTIVE);
        beneficiaryAUser.setRoles(new HashSet<>(Collections.singletonList(roleBeneficiary)));
        beneficiaryAUser = userRepository.save(beneficiaryAUser);

        beneficiaryAOrg = new Organization("Sunshine Old Age Home " + suffix, OrganizationType.OLD_AGE_HOME, "Old age home", "Sister Mary", "8888", "bena@test.org");
        beneficiaryAOrg.setAddress(new Address("Road 10", "Hyderabad", "TS", "500034", new BigDecimal("17.3900"), new BigDecimal("78.4900")));
        beneficiaryAOrg = organizationRepository.save(beneficiaryAOrg);
        organizationMemberRepository.save(new OrganizationMember(beneficiaryAOrg, beneficiaryAUser, "PRIMARY_CONTACT"));

        UserPrincipal benAPrincipal = UserPrincipal.create(beneficiaryAUser);
        beneficiaryAToken = tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(benAPrincipal, null, benAPrincipal.getAuthorities()));

        // 3. Beneficiary B Setup
        beneficiaryBUser = new User("ben_b_" + suffix + "@test.org", passwordEncoder.encode("Pass123!"), UserStatus.ACTIVE);
        beneficiaryBUser.setRoles(new HashSet<>(Collections.singletonList(roleBeneficiary)));
        beneficiaryBUser = userRepository.save(beneficiaryBUser);

        beneficiaryBOrg = new Organization("Hope Children Home " + suffix, OrganizationType.ORPHANAGE, "Orphanage", "Brother John", "7777", "benb@test.org");
        beneficiaryBOrg.setAddress(new Address("Road 14", "Hyderabad", "TS", "500034", new BigDecimal("17.3920"), new BigDecimal("78.4920")));
        beneficiaryBOrg = organizationRepository.save(beneficiaryBOrg);
        organizationMemberRepository.save(new OrganizationMember(beneficiaryBOrg, beneficiaryBUser, "PRIMARY_CONTACT"));

        UserPrincipal benBPrincipal = UserPrincipal.create(beneficiaryBUser);
        beneficiaryBToken = tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(benBPrincipal, null, benBPrincipal.getAuthorities()));
    }

    @Test
    void testCompleteDonationWorkflow_AndPreventDoubleAcceptanceConcurrency() throws Exception {
        // Step 1: Supplier creates donation
        CreateDonationRequest request = new CreateDonationRequest();
        request.setTitle("Vegetable Dum Biryani");
        request.setDescription("Freshly cooked aromatic biryani");
        request.setFoodCategory(FoodCategory.BIRYANI);
        request.setDietaryType(DietaryType.VEGETARIAN);
        request.setApproximateQuantity(new BigDecimal("25.0"));
        request.setQuantityUnit("KG");
        request.setEstimatedServings(50);
        request.setPreparationTime(Instant.now());
        request.setPickupAvailableFrom(Instant.now().plus(1, ChronoUnit.HOURS));
        request.setPickupAvailableUntil(Instant.now().plus(4, ChronoUnit.HOURS));
        request.setConsumeBeforeTime(Instant.now().plus(6, ChronoUnit.HOURS));
        request.setSafetyDeclarationConfirmed(true);

        MvcResult createResult = mockMvc.perform(post("/api/donations")
                .header("Authorization", "Bearer " + supplierToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.estimatedServings").value(50))
                .andReturn();

        DonationDto createdDonation = objectMapper.readValue(createResult.getResponse().getContentAsString(), DonationDto.class);
        UUID donationId = createdDonation.getId();

        // Step 2: Beneficiary discovers donation nearby
        mockMvc.perform(get("/api/donations/nearby?lat=17.3850&lng=78.4867&radiusKm=10")
                .header("Authorization", "Bearer " + beneficiaryAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == '" + donationId + "')]").exists());

        // Step 3: Beneficiary A accepts donation
        mockMvc.perform(post("/api/donations/" + donationId + "/accept")
                .header("Authorization", "Bearer " + beneficiaryAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESERVED"))
                .andExpect(jsonPath("$.acceptedByBeneficiaryName").value(beneficiaryAOrg.getName()));

        // Step 4: CRITICAL CONCURRENCY CHECK: Beneficiary B tries accepting the SAME donation
        // MUST return 409 Conflict: "This donation has already been accepted by another organization."
        mockMvc.perform(post("/api/donations/" + donationId + "/accept")
                .header("Authorization", "Bearer " + beneficiaryBToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This donation has already been accepted by another organization."));

        // Step 5: Supplier marks Ready for Pickup
        mockMvc.perform(post("/api/donations/" + donationId + "/ready")
                .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READY_FOR_PICKUP"));

        // Step 6: Beneficiary A starts pickup
        mockMvc.perform(post("/api/donations/" + donationId + "/pickup/start")
                .header("Authorization", "Bearer " + beneficiaryAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PICKUP_IN_PROGRESS"));

        // Step 7: Beneficiary A marks collected
        mockMvc.perform(post("/api/donations/" + donationId + "/pickup/collected")
                .header("Authorization", "Bearer " + beneficiaryAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COLLECTED"));

        // Step 8: Supplier confirms handover
        mockMvc.perform(post("/api/donations/" + donationId + "/complete")
                .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.handoverConfirmed").value(true));

        // Verify database persistence
        Donation persisted = donationRepository.findById(donationId).orElseThrow();
        assertEquals(DonationStatus.COMPLETED, persisted.getStatus());
        assertEquals(50, persisted.getEstimatedServings());
    }
}
