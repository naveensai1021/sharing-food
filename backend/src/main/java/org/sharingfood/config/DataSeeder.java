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
    private final DonationRepository donationRepository;
    private final FoodSafetyDeclarationRepository safetyDeclarationRepository;
    private final DonationAcceptanceRepository acceptanceRepository;
    private final PickupRepository pickupRepository;
    private final DonationStatusHistoryRepository statusHistoryRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserProfileRepository userProfileRepository,
            OrganizationRepository organizationRepository,
            OrganizationMemberRepository organizationMemberRepository,
            AddressRepository addressRepository,
            BeneficiaryDetailsRepository beneficiaryDetailsRepository,
            DonationRepository donationRepository,
            FoodSafetyDeclarationRepository safetyDeclarationRepository,
            DonationAcceptanceRepository acceptanceRepository,
            PickupRepository pickupRepository,
            DonationStatusHistoryRepository statusHistoryRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            PostLikeRepository postLikeRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userProfileRepository = userProfileRepository;
        this.organizationRepository = organizationRepository;
        this.organizationMemberRepository = organizationMemberRepository;
        this.addressRepository = addressRepository;
        this.beneficiaryDetailsRepository = beneficiaryDetailsRepository;
        this.donationRepository = donationRepository;
        this.safetyDeclarationRepository = safetyDeclarationRepository;
        this.acceptanceRepository = acceptanceRepository;
        this.pickupRepository = pickupRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 5) {
            // Already seeded
            return;
        }

        // 1. Ensure Exactly 3 Roles Supported Across Application
        Role roleAdmin = getOrCreateRole("ROLE_ADMIN");
        Role roleSupplier = getOrCreateRole("ROLE_SUPPLIER");
        Role roleBeneficiary = getOrCreateRole("ROLE_BENEFICIARY");

        // 2. Provision App Admin
        User adminUser = new User("admin@sharingfood.org", passwordEncoder.encode("Admin@123"), UserStatus.APPROVED);
        adminUser.setEmailVerified(true);
        adminUser.getRoles().add(roleAdmin);
        User savedAdmin = userRepository.save(adminUser);
        UserProfile adminProfile = new UserProfile(savedAdmin, "Antigravity Global Administrator", "+91 9900001122", "Hyderabad");
        userProfileRepository.save(adminProfile);

        // 3. Seed Food Suppliers (10 Approved Organizations)
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
            User sUser = new User(email, passwordEncoder.encode("Password@123"), UserStatus.APPROVED);
            sUser.setEmailVerified(true);
            sUser.setReviewedByAdminId(savedAdmin.getId());
            sUser.setReviewedAt(Instant.now().minus(30, ChronoUnit.DAYS));
            sUser.getRoles().add(roleSupplier);
            User savedSUser = userRepository.save(sUser);
            supplierUsers.add(savedSUser);

            UserProfile profile = new UserProfile(savedSUser, (String) data[5], "+91 98765432" + (10 + i), "Hyderabad");
            userProfileRepository.save(profile);

            Organization org = new Organization((String) data[0], OrganizationType.valueOf((String) data[1]), "Premier partner sharing fresh prepared banquet meals.");
            org.setContactPhone("+91 40 2345" + (1000 + i));
            org.setPublicPhone("+91 40 2345" + (1000 + i));
            org.setShowPublicPhone(true);
            org.setContactEmail("info@" + ((String) data[0]).toLowerCase().replaceAll("[^a-z0-9]", "") + ".com");
            org.setPhotoUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500");
            org.setLicenseNumber("FSSAI-12024" + (1000 + i));
            org.setActive(true);
            Organization savedOrg = organizationRepository.save(org);
            suppliers.add(savedOrg);

            Address addr = new Address((String) data[2], "Hyderabad", "Telangana", "5000" + (10 + i), BigDecimal.valueOf((double) data[3]), BigDecimal.valueOf((double) data[4]));
            addr.setOrganization(savedOrg);
            addressRepository.save(addr);

            OrganizationMember member = new OrganizationMember(savedOrg, savedSUser, "ADMIN");
            organizationMemberRepository.save(member);
        }

        // 4. Seed Beneficiaries (8 Approved Shelters / Orphanages / Old-Age Homes)
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
            User bUser = new User(email, passwordEncoder.encode("Password@123"), UserStatus.APPROVED);
            bUser.setEmailVerified(true);
            bUser.setReviewedByAdminId(savedAdmin.getId());
            bUser.setReviewedAt(Instant.now().minus(30, ChronoUnit.DAYS));
            bUser.getRoles().add(roleBeneficiary);
            User savedBUser = userRepository.save(bUser);
            beneficiaryUsers.add(savedBUser);

            UserProfile profile = new UserProfile(savedBUser, (String) data[6], "+91 97654321" + (10 + i), "Hyderabad");
            userProfileRepository.save(profile);

            Organization org = new Organization((String) data[0], OrganizationType.valueOf((String) data[1]), "Registered sanctuary providing care and shelter.");
            org.setContactPhone("+91 40 2456" + (2000 + i));
            org.setPublicPhone("+91 40 2456" + (2000 + i));
            org.setShowPublicPhone(true);
            org.setContactEmail("care@" + ((String) data[0]).toLowerCase().replaceAll("[^a-z0-9]", "") + ".org");
            org.setPhotoUrl("https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500");
            org.setLicenseNumber("NGO-REG-TS-" + (2020 + i));
            org.setActive(true);
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

        // 5. Seed Accounts Across Workflow Lifecycle (Pending, Rejected, Suspended) for Approval Testing
        // A) Pending Supplier
        User pendSup = new User("pending.supplier@sharingfood.org", passwordEncoder.encode("Password@123"), UserStatus.PENDING_APPROVAL);
        pendSup.setEmailVerified(true);
        pendSup.getRoles().add(roleSupplier);
        User savedPendSup = userRepository.save(pendSup);
        userProfileRepository.save(new UserProfile(savedPendSup, "Vikram Patel", "+91 9849011223", "Hyderabad"));
        Organization pendSupOrg = new Organization("Banjara Hills Royal Kitchens", OrganizationType.RESTAURANT, "Fine dining catering service awaiting inspection approval.");
        pendSupOrg.setContactPhone("+91 9849011223");
        pendSupOrg.setPublicPhone("+91 9849011223");
        pendSupOrg.setPhotoUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500");
        pendSupOrg.setLicenseNumber("FSSAI-PENDING-9988");
        pendSupOrg.setActive(false);
        Organization savedPendSupOrg = organizationRepository.save(pendSupOrg);
        Address pendSupAddr = new Address("Road No 12, Banjara Hills", "Hyderabad", "Telangana", "500034", BigDecimal.valueOf(17.412), BigDecimal.valueOf(78.438));
        pendSupAddr.setOrganization(savedPendSupOrg);
        addressRepository.save(pendSupAddr);
        organizationMemberRepository.save(new OrganizationMember(savedPendSupOrg, savedPendSup, "ADMIN"));

        // B) Pending Beneficiary
        User pendBen = new User("pending.beneficiary@sharingfood.org", passwordEncoder.encode("Password@123"), UserStatus.PENDING_APPROVAL);
        pendBen.setEmailVerified(true);
        pendBen.getRoles().add(roleBeneficiary);
        User savedPendBen = userRepository.save(pendBen);
        userProfileRepository.save(new UserProfile(savedPendBen, "Sister Monica", "+91 9849099887", "Hyderabad"));
        Organization pendBenOrg = new Organization("Hope Haven Elderly Care", OrganizationType.OLD_AGE_HOME, "Caring home for abandoned senior citizens.");
        pendBenOrg.setContactPhone("+91 9849099887");
        pendBenOrg.setPublicPhone("+91 9849099887");
        pendBenOrg.setPhotoUrl("https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500");
        pendBenOrg.setLicenseNumber("TRUST-HYD-5544");
        pendBenOrg.setActive(false);
        Organization savedPendBenOrg = organizationRepository.save(pendBenOrg);
        Address pendBenAddr = new Address("Station Road, Secunderabad", "Hyderabad", "Telangana", "500003", BigDecimal.valueOf(17.439), BigDecimal.valueOf(78.501));
        pendBenAddr.setOrganization(savedPendBenOrg);
        addressRepository.save(pendBenAddr);
        beneficiaryDetailsRepository.save(new BeneficiaryDetails(savedPendBenOrg, "OLD_AGE_HOME", 40, 50, "Vegetarian meals preferred"));
        organizationMemberRepository.save(new OrganizationMember(savedPendBenOrg, savedPendBen, "ADMIN"));

        // C) Rejected Account
        User rejUser = new User("rejected.supplier@sharingfood.org", passwordEncoder.encode("Password@123"), UserStatus.REJECTED);
        rejUser.setEmailVerified(true);
        rejUser.setStatusReason("Incomplete food safety documentation and blurry premise photograph.");
        rejUser.setReviewedByAdminId(savedAdmin.getId());
        rejUser.setReviewedAt(Instant.now().minus(2, ChronoUnit.DAYS));
        rejUser.getRoles().add(roleSupplier);
        User savedRejUser = userRepository.save(rejUser);
        userProfileRepository.save(new UserProfile(savedRejUser, "Sunil Gupta", "+91 9811223344", "Hyderabad"));
        Organization rejOrg = new Organization("Quick Bite Express", OrganizationType.RESTAURANT, "Express street food eatery.");
        rejOrg.setContactPhone("+91 9811223344");
        rejOrg.setActive(false);
        Organization savedRejOrg = organizationRepository.save(rejOrg);
        Address rejAddr = new Address("Charminar Bazaar", "Hyderabad", "Telangana", "500002", BigDecimal.valueOf(17.361), BigDecimal.valueOf(78.474));
        rejAddr.setOrganization(savedRejOrg);
        addressRepository.save(rejAddr);
        organizationMemberRepository.save(new OrganizationMember(savedRejOrg, savedRejUser, "ADMIN"));

        // D) Suspended Account
        User suspUser = new User("suspended.supplier@sharingfood.org", passwordEncoder.encode("Password@123"), UserStatus.SUSPENDED);
        suspUser.setEmailVerified(true);
        suspUser.setStatusReason("Repeated non-compliance with safe hot-holding food temperature standards.");
        suspUser.setReviewedByAdminId(savedAdmin.getId());
        suspUser.setReviewedAt(Instant.now().minus(5, ChronoUnit.DAYS));
        suspUser.getRoles().add(roleSupplier);
        User savedSuspUser = userRepository.save(suspUser);
        userProfileRepository.save(new UserProfile(savedSuspUser, "Ramesh Rao", "+91 9822334455", "Hyderabad"));
        Organization suspOrg = new Organization("Midnight Spices Kitchen", OrganizationType.RESTAURANT, "Commercial food prep.");
        suspOrg.setContactPhone("+91 9822334455");
        suspOrg.setActive(false);
        Organization savedSuspOrg = organizationRepository.save(suspOrg);
        Address suspAddr = new Address("Koti Main Road", "Hyderabad", "Telangana", "500095", BigDecimal.valueOf(17.388), BigDecimal.valueOf(78.486));
        suspAddr.setOrganization(savedSuspOrg);
        addressRepository.save(suspAddr);
        organizationMemberRepository.save(new OrganizationMember(savedSuspOrg, savedSuspUser, "ADMIN"));

        // 6. Seed 25+ Food Donations Across All Operational Workflow States
        Instant now = Instant.now();
        List<Donation> seededDonations = new ArrayList<>();

        Object[][] donationDefs = {
                // AVAILABLE
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

                // COMPLETED
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

            Organization supplier = suppliers.get(sIdx);
            User supplierUser = supplierUsers.get(sIdx);

            Donation d = new Donation();
            d.setTitle(title);
            d.setDescription("Carefully preserved freshly prepared banquet food prepared under hygienic supervision.");
            d.setFoodCategory(cat);
            d.setDietaryType(dietary);
            d.setApproximateQuantity(servings * 0.4);
            d.setQuantityUnit("KG");
            d.setEstimatedServings(servings);
            d.setPreparationTime(now.minus(2, ChronoUnit.HOURS));
            d.setPickupAvailableFrom(now.minus(1, ChronoUnit.HOURS));
            d.setPickupAvailableUntil(now.plus(6, ChronoUnit.HOURS));
            d.setConsumeBeforeTime(now.plus(12, ChronoUnit.HOURS));
            d.setStatus(status);
            d.setPackagingStatus("INDIVIDUAL_CONTAINERS");
            d.setSupplier(supplier);
            d.setCreatedByUser(supplierUser);

            Donation savedDonation = donationRepository.save(d);
            seededDonations.add(savedDonation);

            FoodSafetyDeclaration decl = new FoodSafetyDeclaration(savedDonation, supplierUser);
            safetyDeclarationRepository.save(decl);

            if (bIdx >= 0) {
                Organization beneficiary = beneficiaries.get(bIdx);
                User benUser = beneficiaryUsers.get(bIdx);

                DonationAcceptance acceptance = new DonationAcceptance(savedDonation, beneficiary, benUser);
                if (status == DonationStatus.COMPLETED || status == DonationStatus.COLLECTED) {
                    acceptance.setStatus("COLLECTED");
                } else {
                    acceptance.setStatus("APPROVED");
                }
                DonationAcceptance savedAcceptance = acceptanceRepository.save(acceptance);
                savedDonation.setAcceptance(savedAcceptance);

                Pickup pickup = new Pickup(savedDonation, savedAcceptance);
                pickup.setEncryptedOtp("s9Fz/2y7e8Q=");
                pickup.setOtpHash("$2a$10$eE0m1V1N6.kF4Qy8f1mDfeC9G1g4Ym2.n4r2V5sT3K1j8L2r3B4W2");
                pickup.setOtpExpiresAt(now.plus(15, ChronoUnit.MINUTES));
                pickup.setOtpAttempts(0);
                pickup.setOtpUsed(status == DonationStatus.COMPLETED || status == DonationStatus.COLLECTED);
                pickup.setReadyAt(now.minus(1, ChronoUnit.HOURS));
                if (status == DonationStatus.COMPLETED || status == DonationStatus.COLLECTED) {
                    pickup.setOtpVerifiedAt(now.minus(30, ChronoUnit.MINUTES));
                    pickup.setConfirmedServings(servings);
                    pickup.setHandoverConfirmedAt(now.minus(25, ChronoUnit.MINUTES));
                    pickup.setCompletedAt(now.minus(20, ChronoUnit.MINUTES));
                }
                pickupRepository.save(pickup);
                savedDonation.setPickup(pickup);
                donationRepository.save(savedDonation);
            }
        }

        // 7. Community Feed Posts
        Post p1 = new Post(supplierUsers.get(0), "Grateful to partner with Anandham Senior Citizen Home. 75 hot meals safely delivered today!", "Hyderabad");
        p1.setOrganization(suppliers.get(0));
        p1.setLikesCount(14);
        postRepository.save(p1);

        Post p2 = new Post(beneficiaryUsers.get(0), "Heartfelt thanks to Taj Krishna Banquets for the nourishing supper. Our residents send blessings!", "Hyderabad");
        p2.setOrganization(beneficiaries.get(0));
        p2.setLikesCount(22);
        postRepository.save(p2);
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> roleRepository.save(new Role(roleName)));
    }
}
