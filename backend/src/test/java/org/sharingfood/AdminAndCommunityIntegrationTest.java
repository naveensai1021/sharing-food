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
            adminUser = new User("admin_test@sharingfood.org", passwordEncoder.encode("Admin@123"), UserStatus.APPROVED);
            adminUser.setRoles(new HashSet<>(Collections.singletonList(adminRole)));
            adminUser = userRepository.save(adminUser);
        } else {
            adminUser = userRepository.findByEmailIgnoreCase("admin_test@sharingfood.org").get();
        }
        UserPrincipal adminPrincipal = UserPrincipal.create(adminUser);
        adminToken = tokenProvider.generateToken(new UsernamePasswordAuthenticationToken(adminPrincipal, null, adminPrincipal.getAuthorities()));

        // 2. Regular user setup (Approved supplier)
        regularUser = new User("regular_" + suffix + "@test.org", passwordEncoder.encode("User@123"), UserStatus.APPROVED);
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
                .andExpect(jsonPath("$.totalSuppliers").isNumber())
                .andExpect(jsonPath("$.totalBeneficiaries").isNumber())
                .andExpect(jsonPath("$.pendingSupplierApprovals").isNumber())
                .andExpect(jsonPath("$.totalDonations").isNumber())
                .andExpect(jsonPath("$.topSuppliers").isArray());
    }

    @Test
    void testAdminUserApprovalWorkflow() throws Exception {
        Role supplierRole = roleRepository.findByName("ROLE_SUPPLIER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_SUPPLIER")));

        long suffix = System.currentTimeMillis();
        User pendingUser = new User("pending_app_" + suffix + "@test.org", passwordEncoder.encode("Pass@123"), UserStatus.PENDING_APPROVAL);
        pendingUser.setRoles(new HashSet<>(Collections.singletonList(supplierRole)));
        pendingUser = userRepository.save(pendingUser);

        UserProfile profile = new UserProfile(pendingUser, "Kiran Kumar", "9876543210", "Hyderabad");
        userProfileRepository.save(profile);

        // 1. Admin views users
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // 2. Admin approves user
        mockMvc.perform(post("/api/admin/users/" + pendingUser.getId() + "/approve")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        User updatedUser = userRepository.findById(pendingUser.getId()).orElseThrow();
        assertEquals(UserStatus.APPROVED, updatedUser.getStatus());
    }

    @Test
    void testAdminUserRejectionWorkflow() throws Exception {
        Role supplierRole = roleRepository.findByName("ROLE_SUPPLIER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_SUPPLIER")));

        long suffix = System.currentTimeMillis();
        User pendingUser = new User("pending_rej_" + suffix + "@test.org", passwordEncoder.encode("Pass@123"), UserStatus.PENDING_APPROVAL);
        pendingUser.setRoles(new HashSet<>(Collections.singletonList(supplierRole)));
        pendingUser = userRepository.save(pendingUser);

        // Admin rejects user with reason
        mockMvc.perform(post("/api/admin/users/" + pendingUser.getId() + "/reject")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "License document unreadable"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.statusReason").value("License document unreadable"));

        User updatedUser = userRepository.findById(pendingUser.getId()).orElseThrow();
        assertEquals(UserStatus.REJECTED, updatedUser.getStatus());
        assertEquals("License document unreadable", updatedUser.getStatusReason());
    }

    @Test
    void testAdminUserSuspensionAndReactivation() throws Exception {
        long suffix = System.currentTimeMillis();
        User testSubject = new User("misbehaving_" + suffix + "@test.org", passwordEncoder.encode("Pass@123"), UserStatus.APPROVED);
        testSubject = userRepository.save(testSubject);

        // 1. Suspend
        mockMvc.perform(post("/api/admin/users/" + testSubject.getId() + "/suspend")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("reason", "Spam donation posts"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"))
                .andExpect(jsonPath("$.statusReason").value("Spam donation posts"));

        User suspended = userRepository.findById(testSubject.getId()).orElseThrow();
        assertEquals(UserStatus.SUSPENDED, suspended.getStatus());

        // 2. Reactivate
        mockMvc.perform(post("/api/admin/users/" + testSubject.getId() + "/reactivate")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        User reactivated = userRepository.findById(testSubject.getId()).orElseThrow();
        assertEquals(UserStatus.APPROVED, reactivated.getStatus());
    }

    @Test
    void testCommunityPostsLikesCommentsAndReporting() throws Exception {
        // 1. Create a story post
        CreatePostRequest postReq = new CreatePostRequest();
        postReq.setContent("Delivered 50 boxes of warm biryani to Rainbow Children Home! Huge thanks to our donors!");
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
