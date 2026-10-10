package org.sharingfood;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.sharingfood.dto.CreateCommentRequest;
import org.sharingfood.dto.CreatePostRequest;
import org.sharingfood.dto.CreateReportRequest;
import org.sharingfood.entity.*;
import org.sharingfood.repository.RoleRepository;
import org.sharingfood.repository.UserProfileRepository;
import org.sharingfood.repository.UserRepository;
import org.sharingfood.repository.VolunteerProfileRepository;
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

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AdminAndCommunityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private VolunteerProfileRepository volunteerProfileRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private User adminUser;
    private String adminToken;

    private User regularUser;
    private String regularToken;

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));
        Role supplierRole = roleRepository.findByName("ROLE_SUPPLIER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_SUPPLIER")));

        long suffix = System.currentTimeMillis();

        // 1. Admin setup
        if (!userRepository.existsByEmailIgnoreCase("admin_test@sharingfood.org")) {
            adminUser = new User("admin_test@sharingfood.org", passwordEncoder.encode("Admin@123"), UserStatus.ACTIVE);
            adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
            adminUser = userRepository.save(adminUser);
        } else {
            adminUser = userRepository.findByEmailIgnoreCase("admin_test@sharingfood.org").get();
        }
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);
        adminToken = tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(adminPrincipal, null, adminPrincipal.getAuthorities()));

        // 2. Regular user setup
        regularUser = new User("regular_" + suffix + "@test.org", passwordEncoder.encode("User@123"), UserStatus.ACTIVE);
        regularUser.setRoles(new HashSet<>(Collections.singletonList(supplierRole)));
        regularUser = userRepository.save(regularUser);
        UserPrincipal regularPrincipal = UserPrincipal.create(regularUser);
        regularToken = tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(regularPrincipal, null, regularPrincipal.getAuthorities()));
    }

    @Test
    void testAdminDashboardMetrics() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").isNumber())
                .andExpect(jsonPath("$.totalDonations").isNumber())
                .andExpect(jsonPath("$.topSuppliers").isArray())
                .andExpect(jsonPath("$.topVolunteers").isArray());
    }

    @Test
    void testVolunteerVerification_ApprovalWorkflow_Section53Override() throws Exception {
        Role volunteerRole = roleRepository.findByName("ROLE_VOLUNTEER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_VOLUNTEER")));

        long suffix = System.currentTimeMillis();
        User volUser = new User("vol_candidate_" + suffix + "@test.org", passwordEncoder.encode("Vol@123"), UserStatus.ACTIVE);
        volUser.setRoles(new HashSet<>(Collections.singletonList(volunteerRole)));
        volUser = userRepository.save(volUser);

        UserProfile profile = new UserProfile(volUser, "Kiran Kumar", "9876543210", "Hyderabad");
        userProfileRepository.save(profile);

        VolunteerProfile vp = new VolunteerProfile();
        vp.setUser(volUser);
        vp.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        vp.setIdProofType("AADHAAR");
        vp.setIdProofNumber("1234-5678-9012");
        vp.setIdProofDocumentUrl("https://storage.sharingfood.org/id_proof_kiran.pdf");
        vp = volunteerProfileRepository.save(vp);

        // 1. App Admin views pending volunteers
        mockMvc.perform(get("/api/admin/volunteers/pending")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 2. App Admin approves volunteer -> triggers unique VOL-XXXXX generation
        MvcResult approveResult = mockMvc.perform(post("/api/admin/volunteers/" + volUser.getId() + "/approve")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.volunteerCode").isNotEmpty())
                .andReturn();

        String responseBody = approveResult.getResponse().getContentAsString();
        Map<String, Object> map = objectMapper.readValue(responseBody, Map.class);
        String code = (String) map.get("volunteerCode");
        assertTrue(code.startsWith("VOL-"), "Generated Volunteer ID must start with VOL-");

        // Verify volunteer profile status is ACTIVE and code is stored
        VolunteerProfile updatedVp = volunteerProfileRepository.findById(vp.getId()).orElseThrow();
        assertEquals(VerificationStatus.ACTIVE, updatedVp.getVerificationStatus());
        assertEquals(code, updatedVp.getVolunteerCode());
    }

    @Test
    void testVolunteerVerification_RejectionWorkflow() throws Exception {
        Role volunteerRole = roleRepository.findByName("ROLE_VOLUNTEER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_VOLUNTEER")));

        long suffix = System.currentTimeMillis();
        User volUser = new User("vol_reject_" + suffix + "@test.org", passwordEncoder.encode("Vol@123"), UserStatus.ACTIVE);
        volUser.setRoles(new HashSet<>(Collections.singletonList(volunteerRole)));
        volUser = userRepository.save(volUser);

        VolunteerProfile vp = new VolunteerProfile();
        vp.setUser(volUser);
        vp.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
        vp.setIdProofType("DRIVING_LICENSE");
        vp.setIdProofNumber("DL-9999");
        vp.setIdProofDocumentUrl("https://storage.sharingfood.org/blurry_id.jpg");
        vp = volunteerProfileRepository.save(vp);

        // App Admin rejects volunteer with reason
        mockMvc.perform(post("/api/admin/volunteers/" + volUser.getId() + "/reject")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "ID proof is unreadable and blurred"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        VolunteerProfile updatedVp = volunteerProfileRepository.findById(vp.getId()).orElseThrow();
        assertEquals(VerificationStatus.REJECTED, updatedVp.getVerificationStatus());
        assertEquals("ID proof is unreadable and blurred", updatedVp.getRejectionReason());
    }

    @Test
    void testAdminUserSuspensionAndReactivation() throws Exception {
        long suffix = System.currentTimeMillis();
        User testSubject = new User("misbehaving_" + suffix + "@test.org", passwordEncoder.encode("Pass@123"), UserStatus.ACTIVE);
        testSubject = userRepository.save(testSubject);

        // 1. Suspend
        mockMvc.perform(post("/api/admin/users/" + testSubject.getId() + "/suspend")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "Spam donation posts"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));

        User suspended = userRepository.findById(testSubject.getId()).orElseThrow();
        assertEquals(UserStatus.SUSPENDED, suspended.getStatus());

        // 2. Reactivate
        mockMvc.perform(post("/api/admin/users/" + testSubject.getId() + "/reactivate")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        User reactivated = userRepository.findById(testSubject.getId()).orElseThrow();
        assertEquals(UserStatus.ACTIVE, reactivated.getStatus());
    }

    @Test
    void testCommunityPostsLikesCommentsAndReporting() throws Exception {
        // 1. Create a story post
        CreatePostRequest postReq = new CreatePostRequest();
        postReq.setContent("Delivered 50 boxes of warm biryani to Rainbow Children Home! Huge thanks to our volunteers!");
        postReq.setImageUrls(List.of("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500"));
        postReq.setCity("Hyderabad");
        postReq.setTags("#ZeroHunger #FoodRescue");

        MvcResult postResult = mockMvc.perform(post("/api/posts")
                .header("Authorization", "Bearer " + regularToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(postReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.content").value(postReq.getContent()))
                .andReturn();

        Map<String, Object> postMap = objectMapper.readValue(postResult.getResponse().getContentAsString(), Map.class);
        UUID postId = UUID.fromString((String) postMap.get("id"));

        // 2. Toggle like
        mockMvc.perform(post("/api/posts/" + postId + "/like")
                .header("Authorization", "Bearer " + regularToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasLiked").value(true))
                .andExpect(jsonPath("$.likesCount").value(1));

        // 3. Add comment
        CreateCommentRequest commentReq = new CreateCommentRequest();
        commentReq.setContent("Inspiring work by the entire community team!");

        mockMvc.perform(post("/api/posts/" + postId + "/comments")
                .header("Authorization", "Bearer " + regularToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Inspiring work by the entire community team!"));

        // 4. File a misuse report
        CreateReportRequest reportReq = new CreateReportRequest();
        reportReq.setTargetType("POST");
        reportReq.setTargetId(postId);
        reportReq.setReason("MISLEADING");
        reportReq.setDescription("Suspected incorrect meal quantity claim.");

        mockMvc.perform(post("/api/posts/report")
                .header("Authorization", "Bearer " + regularToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reportReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reportId").isNotEmpty());

        // 5. Admin reviews report queue
        mockMvc.perform(get("/api/admin/reports")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testNonAdminAccessToAdminEndpoints_Forbidden() throws Exception {
        // Attempting to access admin dashboard with a regular user token must return 403 Forbidden
        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", "Bearer " + regularToken))
                .andExpect(status().isForbidden());
    }
}
