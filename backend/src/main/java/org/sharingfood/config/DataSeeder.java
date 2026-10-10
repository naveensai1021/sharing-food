package org.sharingfood.config;

import org.sharingfood.entity.*;
import org.sharingfood.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository organizationMemberRepository;
    private final AddressRepository addressRepository;
    private final BeneficiaryDetailsRepository beneficiaryDetailsRepository;
    private final VolunteerProfileRepository volunteerProfileRepository;
    private final DonationRepository donationRepository;
    private final FoodSafetyDeclarationRepository safetyDeclarationRepository;
    private final DonationAcceptanceRepository acceptanceRepository;
    private final PickupRepository pickupRepository;
    private final DonationStatusHistoryRepository statusHistoryRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final VolunteerLeadRepository volunteerLeadRepository;
    private final VolunteerActivityRepository volunteerActivityRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserProfileRepository userProfileRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            AddressRepository addressRepository,
            BeneficiaryDetailsRepository beneficiaryDetailsRepository,
            VolunteerProfileRepository volunteerProfileRepository,
            DonationRepository donationRepository,
            FoodSafetyDeclarationRepository safetyDeclarationRepository,
            DonationAcceptanceRepository acceptanceRepository,
            PickupRepository pickupRepository,
            DonationStatusHistoryRepository statusHistoryRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            PostLikeRepository postLikeRepository,
            VolunteerLeadRepository volunteerLeadRepository,
            VolunteerActivityRepository volunteerActivityRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userProfileRepository = userProfileRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.addressRepository = addressRepository;
        this.beneficiaryDetailsRepository = beneficiaryDetailsRepository;
        this.volunteerProfileRepository = volunteerProfileRepository;
        this.donationRepository = donationRepository;
        this.safetyDeclarationRepository = safetyDeclarationRepository;
        this.acceptanceRepository = acceptanceRepository;
        this.pickupRepository = pickupRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.volunteerLeadRepository = volunteerLeadRepository;
        this.volunteerActivityRepository = volunteerActivityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 5) {
            // Already seeded
            return;
        }

        // 1. Ensure Roles
        Role roleAdmin = getOrCreateRole("ROLE_ADMIN");
        Role roleSupplier = getOrCreateRole("ROLE_SUPPLIER");
        Role roleBeneficiary = getOrCreateRole("ROLE_BENEFICIARY");
        Role roleVolunteer = getOrCreateRole("ROLE_VOLUNTEER");

        // 2. Provision App Admin (Never on public signup page)
        User adminUser = new User("admin@sharingfood.org", passwordEncoder.encode("Admin@123"), UserStatus.ACTIVE);
        adminUser.getRoles().add(roleAdmin);
        User savedAdmin = userRepository.save(adminUser);
        UserProfile adminProfile = new UserProfile(savedAdmin, "Antigravity Global Administrator", "+91 9900001122", "Hyderabad");
        userProfileRepository.save(adminProfile);

        // 3. Seed Food Suppliers (10 Organizations)
        List<Organization> suppliers = new ArrayList<>();
        List<User> supplierUsers = new ArrayList<>();

        Object[][] supplierData = {
                {"Taj Krishna Banquets", "CATERER", "Banjara Hills, Road No. 1", 17.4156, 78.4487, "Executive Chef Rajesh"},
                {"Paradise Food Court", "RESTAURANT", "SD Road, Secunderabad", 17.4411, 78.4983, "Manager Srinivas"},
                {"Bawarchi Biryani House", "RESTAURANT", "RTC X Roads, Musheerabad", 17.4022, 78.4958, "Catering Head Farhan"},
                {"Grand Palace Convention", "CATERER", "ISB Road, Gachibowli", 17.4401, 78.3489, "Event Dir. Vikram"},
                {"Chutneys Family Restaurant", "RESTAURANT", "Jubilee Hills Check Post", 17.4319, 78.4073, "Manager Murthy"},
                {"Karachi Bakery & Cafe", "BAKERY", "Mozamjahi Market, Abids", 17.3871, 78.4735, "Owner Harish"},
                {"Minerva Grand Banquets", "CATERER", "Himayatnagar Main Road", 17.3995, 78.4878, "Banquet Mgr Ananya"},
                {"Shah Ghouse Caterers", "CATERER", "Tolichowki Flyover", 17.3980, 78.4110, "Chef Zaid"},
                {"Subhan Bakery", "BAKERY", "Nampally Station Road", 17.3892, 78.4682, "Syed Irfan"},
                {"Novotel HICC Catering", "CATERER", "Hitec City, Madhapur", 17.4719, 78.3725, "Banquet Head Meera"}
        };

        for (int i = 0; i < supplierData.length; i++) {
            Object[] data = supplierData[i];
            String email = "supplier" + (i + 1) + "@sharingfood.org";
            User sUser = new User(email, passwordEncoder.encode("Password@123"), UserStatus.ACTIVE);
            sUser.getRoles().add(roleSupplier);
            User savedSUser = userRepository.save(sUser);
            supplierUsers.add(savedSUser);

            UserProfile profile = new UserProfile(savedSUser, (String) data[5], "+91 98765432" + (10 + i), "Hyderabad");
            userProfileRepository.save(profile);

            Organization org = new Organization((String) data[0], OrganizationType.valueOf((String) data[1]), "Premier partner sharing fresh prepared banquet meals.");
            org.setContactPhone("+91 40 2345" + (1000 + i));
            org.setContactEmail("info@" + ((String) data[0]).toLowerCase().replaceAll("[^a-z0-9]", "") + ".com");
            Organization savedOrg = organizationRepository.save(org);
            suppliers.add(savedOrg);

            Address addr = new Address((String) data[2], "Hyderabad", "Telangana", "5000" + (10 + i), BigDecimal.valueOf((double) data[3]), BigDecimal.valueOf((double) data[4]));
            addr.setOrganization(savedOrg);
            addressRepository.save(addr);

            OrganizationMember member = new OrganizationMember(savedOrg, savedSUser, "ADMIN");
            organizationMemberRepository.save(member);
        }

        // 4. Seed Beneficiaries (8 Shelters / Orphanages / Old-Age Homes)
        List<Organization> beneficiaries = new ArrayList<>();
        List<User> beneficiaryUsers = new ArrayList<>();

        Object[][] beneficiaryData = {
                {"Anandham Senior Citizen Home", "OLD_AGE_HOME", "Amberpet Old Cheyutha Rd", 17.3948, 78.5132, 65, "Warden Preethi"},
                {"Aasha Children Orphanage", "ORPHANAGE", "Kacheguda Station Rd", 17.3900, 78.4980, 80, "Sister Rita"},
                {"Grace Haven Elder Care", "OLD_AGE_HOME", "Begumpet Airport Rd", 17.4435, 78.4712, 45, "Brother Thomas"},
                {"Sneha Orphan Home", "ORPHANAGE", "Sanathnagar Industrial Area", 17.4583, 78.4412, 60, "Director Kavitha"},
                {"Mother Teresa Compassion Shelter", "COMMUNITY_SHELTER", "Nampally Dargah Lane", 17.3850, 78.4720, 110, "Father Francis"},
                {"Sanjeevani Elder Sanctuary", "OLD_AGE_HOME", "Mehdipatnam Pillar 42", 17.3920, 78.4400, 50, "Dr. Rao"},
                {"Little Angels Orphan Care", "ORPHANAGE", "Dilsukhnagar Bus Depot", 17.3688, 78.5247, 75, "Sister Clara"},
                {"Karuna Old Age Home", "OLD_AGE_HOME", "Kukatpally Y Junction", 17.4938, 78.4018, 55, "Smt. Shanta"}
        };

        for (int i = 0; i < beneficiaryData.length; i++) {
            Object[] data = beneficiaryData[i];
            String email = "beneficiary" + (i + 1) + "@sharingfood.org";
            User bUser = new User(email, passwordEncoder.encode("Password@123"), UserStatus.ACTIVE);
            bUser.getRoles().add(roleBeneficiary);
            User savedBUser = userRepository.save(bUser);
            beneficiaryUsers.add(savedBUser);

            UserProfile profile = new UserProfile(savedBUser, (String) data[6], "+91 97654321" + (10 + i), "Hyderabad");
            userProfileRepository.save(profile);

            Organization org = new Organization((String) data[0], OrganizationType.valueOf((String) data[1]), "Registered sanctuary providing care and shelter.");
            org.setContactPhone("+91 40 2456" + (2000 + i));
            org.setContactEmail("care@" + ((String) data[0]).toLowerCase().replaceAll("[^a-z0-9]", "") + ".org");
            Organization savedOrg = organizationRepository.save(org);
            beneficiaries.add(savedOrg);

            Address addr = new Address((String) data[2], "Hyderabad", "Telangana", "5000" + (30 + i), BigDecimal.valueOf((double) data[3]), BigDecimal.valueOf((double) data[4]));
            addr.setOrganization(savedOrg);
            addressRepository.save(addr);

            BeneficiaryDetails details = new BeneficiaryDetails(savedOrg, (String) data[1], (int) data[5], (int) data[5] + 20, "Providing food and healthcare to elderly and orphaned souls.");
            beneficiaryDetailsRepository.save(details);

            OrganizationMember member = new OrganizationMember(savedOrg, savedBUser, "ADMIN");
            organizationMemberRepository.save(member);
        }

        // 5. Seed Volunteers (8 Active Verified + 2 Pending Verification)
        List<User> activeVolunteers = new ArrayList<>();
        String[] volunteerNames = {
                "Aarav Sharma", "Diya Reddy", "Kiran Verma", "Neha Patel",
                "Rohan Joshi", "Pooja Nair", "Aditya Kulkarni", "Sneha Roy"
        };

        for (int i = 0; i < volunteerNames.length; i++) {
            String email = "volunteer" + (i + 1) + "@sharingfood.org";
            User vUser = new User(email, passwordEncoder.encode("Password@123"), UserStatus.ACTIVE);
            vUser.getRoles().add(roleVolunteer);
            User savedVUser = userRepository.save(vUser);
            activeVolunteers.add(savedVUser);

            UserProfile profile = new UserProfile(savedVUser, volunteerNames[i], "+91 91234567" + (10 + i), "Hyderabad");
            userProfileRepository.save(profile);

            VolunteerProfile vp = new VolunteerProfile();
            vp.setUser(savedVUser);
            vp.setVolunteerCode("VOL-1000" + (i + 1));
            vp.setVerificationStatus(VerificationStatus.ACTIVE);
            vp.setVerifiedAt(Instant.now().minus(10, ChronoUnit.DAYS));
            vp.setVerifiedByAdminId(savedAdmin.getId());
            vp.setIdProofType("AADHAAR");
            vp.setIdProofNumber("XXXX-XXXX-" + (1000 + i));
            vp.setIdProofDocumentUrl("https://images.unsplash.com/photo-1544717305-2782549b5136?w=400");
            vp.setOrganizationsContactedCount(12 + i * 2);
            vp.setOrganizationsOnboardedCount(3 + i);
            vp.setDonationsAssistedCount(5 + i * 3);
            volunteerProfileRepository.save(vp);

            // Log activities and leads
            VolunteerActivity act = new VolunteerActivity(
                    savedVUser,
                    "FOOD_PICKUP_ASSISTANCE",
                    "Assisted Anandham Home collecting 60 lunch meal boxes from Taj Krishna.",
                    BigDecimal.valueOf(2.5),
                    LocalDate.now().minusDays(i + 1)
            );
            volunteerActivityRepository.save(act);

            VolunteerLead lead = new VolunteerLead(
                    savedVUser,
                    "Grand Kitchen Caterers",
                    "CATERER",
                    "Chef Ramesh",
                    "+91 99887766" + i,
                    "ramesh@grandkitchen.com",
                    "Madhapur Main Road",
                    "Hyderabad",
                    "Interested in donating weekend wedding surplus."
            );
            lead.setStatus(i % 2 == 0 ? "ONBOARDED" : "CONTACTED");
            volunteerLeadRepository.save(lead);
        }

        // 2 Pending Verification Volunteers
        String[] pendingNames = {"Manish Kumar", "Sunita Desai"};
        for (int i = 0; i < pendingNames.length; i++) {
            String email = "pending.vol" + (i + 1) + "@sharingfood.org";
            User pvUser = new User(email, passwordEncoder.encode("Password@123"), UserStatus.ACTIVE);
            pvUser.getRoles().add(roleVolunteer);
            User savedPvUser = userRepository.save(pvUser);

            UserProfile profile = new UserProfile(savedPvUser, pendingNames[i], "+91 93333444" + (10 + i), "Hyderabad");
            userProfileRepository.save(profile);

            VolunteerProfile vp = new VolunteerProfile();
            vp.setUser(savedPvUser);
            vp.setVerificationStatus(VerificationStatus.PENDING_VERIFICATION);
            vp.setIdProofType(i == 0 ? "AADHAAR" : "PASSPORT");
            vp.setIdProofNumber(i == 0 ? "7890-1234-5678" : "P1234567");
            vp.setIdProofDocumentUrl("https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400");
            volunteerProfileRepository.save(vp);
        }

        // 6. Seed 25+ Food Donations Across All Workflow States
        Instant now = Instant.now();
        List<Donation> seededDonations = new ArrayList<>();

        Object[][] donationDefs = {
                // Title, Category, Dietary, Servings, SupplierIdx, Status, BeneficiaryIdx
                {"Fresh Vegetable Biryani & Dal Makhani", "BIRYANI", "VEGETARIAN", 75, 0, DonationStatus.AVAILABLE, -1},
                {"Surplus Banquet Rice & Paneer Butter Masala", "RICE", "VEGETARIAN", 60, 1, DonationStatus.AVAILABLE, -1},
                {"Assorted Artisan Pastries & Milk Breads", "DESSERTS", "VEGETARIAN", 40, 5, DonationStatus.AVAILABLE, -1},
                {"Steamed Rice, Sambar & Mixed Veggies", "RICE", "VEGETARIAN", 90, 4, DonationStatus.AVAILABLE, -1},
                {"Hyderabadi Chicken Dum Biryani", "BIRYANI", "NON_VEGETARIAN", 100, 2, DonationStatus.AVAILABLE, -1},
                {"Osmania Biscuits & Fruit Cookies", "SNACKS", "VEGETARIAN", 50, 8, DonationStatus.AVAILABLE, -1},
                {"Chapati Breads & Mixed Veg Curry", "ROTI_BREAD", "VEGETARIAN", 65, 6, DonationStatus.AVAILABLE, -1},
                {"South Indian Tiffin Trays (Idli & Vada)", "SNACKS", "VEGETARIAN", 45, 0, DonationStatus.AVAILABLE, -1},

                // RESERVED
                {"Continental Pasta & Garlic Baguettes", "MIXED_MEAL", "VEGETARIAN", 50, 3, DonationStatus.RESERVED, 0},
                {"Gourmet Pulao & Methi Chaman", "RICE", "VEGETARIAN", 70, 0, DonationStatus.RESERVED, 1},
                {"Rich Mutton Curry & Rumali Rotis", "CURRY", "NON_VEGETARIAN", 85, 7, DonationStatus.RESERVED, 4},
                {"Dinner Buffet Rice & Vegetable Korma", "RICE", "VEGETARIAN", 55, 9, DonationStatus.RESERVED, 2},

                // READY_FOR_PICKUP
                {"Wedding Feast Surplus (Sambar Rice & Curd Rice)", "RICE", "VEGETARIAN", 120, 3, DonationStatus.READY_FOR_PICKUP, 0},
                {"Wholesome Khichdi & Tomato Chutney", "RICE", "VEGETARIAN", 40, 4, DonationStatus.READY_FOR_PICKUP, 3},
                {"Butter Chicken & Tandoori Rotis", "CURRY", "NON_VEGETARIAN", 65, 2, DonationStatus.READY_FOR_PICKUP, 1},

                // PICKUP_IN_PROGRESS
                {"Lunch Trays: Jeera Rice & Rajma Masala", "RICE", "VEGETARIAN", 55, 6, DonationStatus.PICKUP_IN_PROGRESS, 5},
                {"Executive Lounge Sandwiches & Rolls", "SNACKS", "VEGETARIAN", 35, 9, DonationStatus.PICKUP_IN_PROGRESS, 6},
                {"Hyderabadi Dum Mutton Biryani Large Tray", "BIRYANI", "NON_VEGETARIAN", 90, 7, DonationStatus.PICKUP_IN_PROGRESS, 7},

                // COLLECTED
                {"Corporate Luncheon Salad & Pulao Bowls", "RICE", "VEGETARIAN", 45, 0, DonationStatus.COLLECTED, 0},
                {"Whole Wheat Rotis & Mixed Dal", "ROTI_BREAD", "VEGETARIAN", 80, 1, DonationStatus.COLLECTED, 2},
                {"Fruit Platters & Fresh Cakes", "FRUITS", "VEGETARIAN", 30, 5, DonationStatus.COLLECTED, 3},

                // COMPLETED (Historical impact)
                {"Gourmet Dinner Buffet Surplus", "MIXED_MEAL", "VEGETARIAN", 110, 0, DonationStatus.COMPLETED, 0},
                {"Community Kitchen Rice & Dal", "RICE", "VEGETARIAN", 150, 1, DonationStatus.COMPLETED, 1},
                {"Conference Center Packed Meals", "PACKAGED_FOOD", "VEGETARIAN", 75, 3, DonationStatus.COMPLETED, 2},
                {"Celebration Cake & Muffins", "DESSERTS", "VEGETARIAN", 50, 5, DonationStatus.COMPLETED, 3},
                {"Sunday Special Chicken Pulao", "RICE", "NON_VEGETARIAN", 95, 2, DonationStatus.COMPLETED, 4},
                {"Breakfast Idli, Sambar & Upma", "SNACKS", "VEGETARIAN", 60, 4, DonationStatus.COMPLETED, 5},
                {"Convention Center Evening Meal Boxes", "PACKAGED_FOOD", "VEGETARIAN", 85, 9, DonationStatus.COMPLETED, 6},
                {"Royal Mughlai Feast Surplus", "MIXED_MEAL", "NON_VEGETARIAN", 120, 7, DonationStatus.COMPLETED, 7},

                // EXPIRED
                {"Unclaimed Breakfast Rolls", "ROTI_BREAD", "VEGETARIAN", 25, 5, DonationStatus.EXPIRED, -1},
                {"Day-Old Soup & Dinner Rolls", "MIXED_MEAL", "VEGETARIAN", 30, 6, DonationStatus.EXPIRED, -1}
        };

        for (Object[] def : donationDefs) {
            String title = (String) def[0];
            FoodCategory cat = FoodCategory.valueOf((String) def[1]);
            DietaryType dietary = DietaryType.valueOf((String) def[2]);
            int servings = (int) def[3];
            int sIdx = (int) def[4];
            DonationStatus status = (DonationStatus) def[5];
            int bIdx = (int) def[6];

            Organization sOrg = suppliers.get(sIdx);
            User sUser = supplierUsers.get(sIdx);

            Donation d = new Donation();
            d.setSupplier(sOrg);
            d.setCreatedByUser(sUser);
            d.setTitle(title);
            d.setFoodCategory(cat);
            d.setDietaryType(dietary);
            d.setApproximateQuantity(java.math.BigDecimal.valueOf(servings * 0.4));
            d.setQuantityUnit("KG");
            d.setEstimatedServings(servings);
            d.setStatus(status);
            d.setPreparationTime(now.minus(2, ChronoUnit.HOURS));
            d.setConsumeBeforeTime(now.plus(6, ChronoUnit.HOURS));
            d.setPickupAvailableFrom(now.minus(1, ChronoUnit.HOURS));
            d.setPickupAvailableUntil(status == DonationStatus.EXPIRED ? now.minus(1, ChronoUnit.HOURS) : now.plus(4, ChronoUnit.HOURS));
            d.setPackagingStatus("HYGIENIC_FOOD_GRADE_CONTAINERS");
            d.setSpecialInstructions("Please handle with care and transport in insulated hot-carrier boxes.");
            d.setPickupAddress(sOrg.getAddress());

            // Add Food Item
            DonationFoodItem item = new DonationFoodItem(title, servings + " servings (" + (servings * 0.4) + " kg)");
            d.addFoodItem(item);

            // Add Image
            d.addImage(new DonationImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500", true));

            Donation savedD = donationRepository.save(d);
            seededDonations.add(savedD);

            // Food Safety Declaration (Section 16 mandatory pledge)
            FoodSafetyDeclaration decl = new FoodSafetyDeclaration(
                    savedD,
                    sUser,
                    "Prepared in licensed hygienic kitchen. FSSAI standards verified. Hot holding temperature maintained.",
                    "1.0"
            );
            safetyDeclarationRepository.save(decl);

            // If claimed or further in lifecycle
            if (bIdx >= 0) {
                Organization bOrg = beneficiaries.get(bIdx);
                User bUser = beneficiaryUsers.get(bIdx);

                DonationAcceptance acceptance = new DonationAcceptance(savedD, bOrg, bUser);
                if (status == DonationStatus.COMPLETED) {
                    acceptance.setStatus("COMPLETED");
                }
                DonationAcceptance savedAcceptance = acceptanceRepository.save(acceptance);

                Pickup pickup = new Pickup(savedD, savedAcceptance);
                if (status == DonationStatus.READY_FOR_PICKUP) {
                    pickup.setReadyAt(now.minus(1, ChronoUnit.HOURS));
                } else if (status == DonationStatus.PICKUP_IN_PROGRESS) {
                    pickup.setReadyAt(now.minus(1, ChronoUnit.HOURS));
                    pickup.setPickupStartedAt(now.minus(20, ChronoUnit.MINUTES));
                } else if (status == DonationStatus.COLLECTED) {
                    pickup.setReadyAt(now.minus(2, ChronoUnit.HOURS));
                    pickup.setPickupStartedAt(now.minus(1, ChronoUnit.HOURS));
                    pickup.setCollectedAt(now.minus(30, ChronoUnit.MINUTES));
                } else if (status == DonationStatus.COMPLETED) {
                    pickup.setReadyAt(now.minus(3, ChronoUnit.HOURS));
                    pickup.setPickupStartedAt(now.minus(2, ChronoUnit.HOURS));
                    pickup.setCollectedAt(now.minus(1, ChronoUnit.HOURS));
                    pickup.setCompletedAt(now.minus(30, ChronoUnit.MINUTES));
                    pickup.setHandoverConfirmedBySupplier(true);
                }
                pickupRepository.save(pickup);
            }

            // Status history
            statusHistoryRepository.save(new DonationStatusHistory(
                    savedD, null, status.name(), sUser, "System initialized workflow state"
            ));
        }

        // 7. Seed Community Posts (10 inspiring stories with likes and comments)
        String[][] postStories = {
                {"Heartwarming evening at Anandham Senior Citizen Home! Thanks to Taj Krishna Banquets for 75 wholesome meals. The smiles on our grandparents' faces said everything. #FoodRescue #SpreadingLove #ZeroHunger", "Hyderabad", "#FoodRescue #SpreadingLove"},
                {"Huge appreciation to our verified volunteer Aarav for swiftly coordinating the pickup from Grand Palace Convention to Aasha Children Orphanage. 60 happy children tonight! #VolunteersRock", "Hyderabad", "#VolunteersRock #ChildWelfare"},
                {"Paradise Food Court is proud to partner with Sharing Food, Spreading Love. No good food should ever go to waste. 1,000+ meals shared this month alone! #SustainableHospitality", "Secunderabad", "#SustainableHospitality #Community"},
                {"Delivered fresh pastries and artisanal milk breads to Sneha Orphan Home today. Sweet treats brought so much cheer! Thank you Karachi Bakery. #SweetSmiles", "Hyderabad", "#SweetSmiles #FoodRescue"},
                {"Mother Teresa Compassion Shelter received warm dinner for 110 residents tonight. Thank you Shah Ghouse Caterers for the rich biryani! #Blessings #EndHunger", "Hyderabad", "#Blessings #EndHunger"}
        };

        for (int i = 0; i < postStories.length; i++) {
            User author = i % 2 == 0 ? beneficiaryUsers.get(i % beneficiaryUsers.size()) : supplierUsers.get(i % supplierUsers.size());
            Organization org = i % 2 == 0 ? beneficiaries.get(i % beneficiaries.size()) : suppliers.get(i % suppliers.size());

            Post post = new Post(author, org, postStories[i][0], postStories[i][1], postStories[i][2]);
            post.setLikesCount(12 + i * 5);
            post.setCommentsCount(3);
            post.addImage(new PostImage("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600"));

            Post savedPost = postRepository.save(post);

            // Add Likes
            for (int k = 0; k < Math.min(3, activeVolunteers.size()); k++) {
                postLikeRepository.save(new PostLike(savedPost, activeVolunteers.get(k)));
            }

            // Add Comments
            commentRepository.save(new Comment(savedPost, activeVolunteers.get(0), "So honored to be part of this wonderful rescue!"));
            commentRepository.save(new Comment(savedPost, savedAdmin, "Exemplary community partnership. Thank you for your leadership!"));
            commentRepository.save(new Comment(savedPost, beneficiaryUsers.get(0), "Deep gratitude from all our residents and caretakers!"));
        }
    }

    private Role getOrCreateRole(String name) {
        return roleRepository.findByName(name).orElseGet(() -> roleRepository.save(new Role(name)));
    }
}
