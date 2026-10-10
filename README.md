# Sharing Food, Spreading Love – NGO Food Rescue Platform

A production-grade, enterprise full-stack platform connecting food donors (restaurants, caterers, banquet halls, bakeries) with nearby beneficiaries (old-age homes, orphanages, community shelters) through volunteer-powered outreach, rigorous food safety declarations, real-time same-day rescue workflows, and administrative oversight.

---

## 🌟 Governing Architecture & Priority Requirements

### 1. Section 53 Override: Volunteer Verification & Direct Organization Onboarding
In accordance with **Section 53 of the Product Requirement Document (PRD)**:
* **Food Suppliers**: Register directly, enter required organization details, and become **`ACTIVE` immediately** without administrative approval. They can immediately publish food donation rescue listings.
* **Beneficiaries**: Register directly, enter organization details (including resident count and capacity), and become **`ACTIVE` immediately** without administrative approval. They can immediately browse and claim donations.
* **Volunteers**:
  1. Register with personal information.
  2. Upload government ID proof document (`AADHAAR`, `PAN`, `DRIVING_LICENSE`, `PASSPORT`).
  3. Enter **`PENDING_VERIFICATION`** status.
  4. Only **App Admin** can review the volunteer's ID proof and Approve or Reject the application.
  5. Upon approval, an immutable, unique Volunteer Code (`VOL-XXXXX`) is generated and the volunteer becomes **`ACTIVE`**.
  6. In-app notifications inform the volunteer of the verification decision.
  7. **Volunteer Attribution**: During Supplier or Beneficiary signup, new organizations can optionally enter a **Volunteer ID**. The backend cryptographically validates that the code belongs to an **ACTIVE verified volunteer**, stores the referral attribution (`onboardedByVolunteerId`), and increments the volunteer's outreach statistics.
* **App Admin**:
  - Accounts are provisioned via secure administrative seed routines (never open to public registration).
  - Admins inspect misuse reports, monitor platform KPIs, suspend/reactivate abusive accounts, and review Volunteer identity verifications.
  - **Admins NEVER approve**: Supplier signups, Beneficiary signups, food donations, or community stories.

### 2. High-Concurrency Double Acceptance Prevention
* **Backend Database Concurrency Engine**: Solved using Spring Data JPA `@Lock(LockModeType.PESSIMISTIC_WRITE)` with `@Transactional` on `DonationRepository.findByIdForUpdate(UUID id)`.
* **Behavior**: If Beneficiary A claims a donation milliseconds before Beneficiary B, Beneficiary A acquires the row lock, validates the `AVAILABLE` status, and transitions the donation to `RESERVED`. When Beneficiary B's concurrent transaction evaluates the locked row, it detects the state transition and throws `DonationAlreadyReservedException`, immediately returning **HTTP 409 Conflict** with an informative message.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries & Specifications |
|---|---|---|
| **Backend** | Java 21, Spring Boot 3.3.4 | Spring Security 6, Spring Data JPA, Hibernate ORM, Bean Validation (Jakarta) |
| **Authentication** | JWT + HttpOnly Cookies | Role-Based Access Control (`ROLE_ADMIN`, `ROLE_SUPPLIER`, `ROLE_BENEFICIARY`, `ROLE_VOLUNTEER`) |
| **Database** | PostgreSQL 16 (H2 in Test Profile) | Flyway Migrations, UUID Primary Keys, Pessimistic Row Locking, Geospatial Indexes |
| **Frontend** | Next.js 14.2 (App Router), React 18 | TypeScript, Tailwind CSS, Lucide Icons, Sonner Toasts, Leaflet Maps, Recharts |
| **DevOps** | Docker, Docker Compose, Maven Wrapper | Multi-stage Docker builds, PostgreSQL health checks |

---

## 📁 Project Architecture

```
sharing-food-spreading-love/
├── backend/
│   ├── src/main/java/org/sharingfood/
│   │   ├── config/              # SecurityConfig, CorsConfig, DataSeeder, WebConfig
│   │   ├── controller/          # Auth, Donation, Admin, Volunteer, Post, Notification, Org Controllers
│   │   ├── dto/                 # Strongly-typed Request and Response Transfer Objects
│   │   ├── entity/              # 26 JPA Entities: User, Organization, Donation, Pickup, etc.
│   │   ├── exception/           # GlobalExceptionHandler, Custom Exceptions (400, 403, 404, 409)
│   │   ├── repository/          # 22 Spring Data JPA Repositories with custom queries & locks
│   │   ├── security/            # JwtAuthenticationFilter, JwtTokenProvider, UserPrincipal
│   │   ├── service/             # AdminService, DonationService, VolunteerService, PostService, GeospatialService
│   ├── src/main/resources/
│   │   ├── db/migration/        # V1__initial_schema.sql (Flyway DDL with all tables and indexes)
│   │   ├── application.yml      # Spring Boot application configuration
│   └── src/test/java/           # Comprehensive Unit & Integration Tests (11 test suites passing)
├── frontend/
│   ├── app/                     # 27 Prerendered Next.js App Router Routes
│   │   ├── admin/               # /dashboard, /volunteers, /users, /reports, /donations, /analytics
│   │   ├── beneficiary/         # /dashboard, /find-food (Map & List view), /pickups
│   │   ├── supplier/            # /dashboard, /donations, /donations/create
│   │   ├── volunteer/           # /dashboard, /leads, /activities
│   │   ├── community/           # Real-time community story feed, photo viewer, likes & comments
│   │   ├── notifications/       # In-app notifications center with mark-all-read
│   │   ├── organizations/       # Public organization search directory with impact metrics
│   │   ├── login/ & register/   # Interactive authentication with Fast Demo Login buttons
│   │   └── about/ & impact/     # Public mission statement and live impact counters
│   ├── components/              # Navigation bar, Footer, Notification dropdown, UI components
│   ├── features/auth/           # AuthContext, ProtectedRoute, role guard hooks
│   └── services/apiClient.ts    # Centralized HTTP Client with cookie forwarding & error handling
├── docker-compose.yml           # Multi-container orchestration (Postgres, Backend, Frontend)
└── README.md                    # Platform documentation
```

---

## 🔑 Pre-Seeded Demonstration Accounts

For demonstration and evaluation, the backend `DataSeeder` automatically populates the database on startup with production-grade data:

| Role | Email Address | Password | Profile / Assignment |
|---|---|---|---|
| **App Admin** | `admin@sharingfood.org` | `Admin@123` | System Administrator (Full Oversight) |
| **Food Supplier** | `taj.krishna@hyderabadfood.org` | `Supplier@123` | Taj Krishna Banquets (Restaurant / Caterer) |
| **Beneficiary** | `anandham.home@charity.org` | `Beneficiary@123` | Anandham Senior Citizen Home (Old Age Home) |
| **Volunteer** | `aarav.sharma@volunteer.org` | `Volunteer@123` | Active Verified Volunteer (`VOL-10001`) |

> 💡 **Quick Demo Feature**: The `/login` page includes **Fast Demo Login Buttons** that instantly sign you in as any role with a single click.

---

## 🚀 Getting Started

### Option 1: Run with Docker Compose (Recommended)

Make sure you have Docker and Docker Compose installed:

```bash
# 1. Clone or navigate to the repository
cd sharing-food-spreading-love

# 2. Start PostgreSQL, Backend, and Frontend containers
docker-compose up -d --build

# 3. View running containers
docker-compose ps
```

* **Frontend Web App**: http://localhost:3000
* **Backend REST API**: http://localhost:8080
* **PostgreSQL Database**: `localhost:5432` (`sharingfood` / `postgres` / `postgres`)

---

### Option 2: Run Locally (Maven + Node.js)

#### 1. Prerequisites
- **Java 21+** (`java -version`)
- **Node.js 18+** (`node -v`) and `npm`
- **PostgreSQL 14+** running locally (or use H2 test profile)

#### 2. Backend Setup
```bash
cd backend

# Run the test suite (11 integration tests pass automatically)
./mvnw test

# Start the Spring Boot backend server
./mvnw spring-boot:run
```
The backend starts at `http://localhost:8080`.

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies (already resolved)
npm install

# Build production bundle
npm run build

# Start Next.js development server
npm run dev
```
The frontend starts at `http://localhost:3000`.

---

## 🧪 Verification & Automated Testing

The backend includes comprehensive integration tests verifying all critical PRD workflows:

```bash
cd backend
./mvnw test
```

### Automated Integration Test Coverage:
1. `AuthAndVolunteerAttributionIntegrationTest`
   - `testSupplierRegistration_DirectlyActive`: Verifies Food Suppliers become ACTIVE immediately without admin approval.
   - `testBeneficiaryRegistration_DirectlyActive`: Verifies Beneficiaries become ACTIVE immediately.
   - `testVolunteerRegistration_EntersPendingVerification_AndAttributionWorks`: Verifies Volunteers enter PENDING_VERIFICATION until admin approval, and verifies attribution increment upon organization signup.
   - `testLoginAndCookieAuthentication`: Verifies secure cookie issuing and principal authentication.
2. `DonationWorkflowAndConcurrencyIntegrationTest`
   - `testCompleteDonationWorkflow_AndPreventDoubleAcceptanceConcurrency`: Tests multi-step lifecycle (`AVAILABLE -> RESERVED -> READY_FOR_PICKUP -> PICKUP_IN_PROGRESS -> COLLECTED -> COMPLETED`) and proves that concurrent double acceptance throws **HTTP 409 Conflict**.
3. `AdminAndCommunityIntegrationTest`
   - `testAdminDashboardMetrics`: Verifies calculation of platform KPIs, active donations, and leaderboards.
   - `testVolunteerVerification_ApprovalWorkflow_Section53Override`: Verifies admin inspection and one-click approval issuing unique `VOL-XXXXX`.
   - `testVolunteerVerification_RejectionWorkflow`: Verifies admin rejection recording reasons.
   - `testAdminUserSuspensionAndReactivation`: Verifies account suspension and reactivation controls.
   - `testCommunityPostsLikesCommentsAndReporting`: Verifies social post creation, like toggles, comment threads, and misuse reporting.
   - `testNonAdminAccessToAdminEndpoints_Forbidden`: Verifies that non-admin requests to `/api/admin/**` return **HTTP 403 Forbidden**.

---

## 🛡️ Security Architecture

1. **HttpOnly Cookie Tokens**: Tokens are delivered in secure HttpOnly cookies (`SF_AUTH_TOKEN`) preventing JavaScript access and XSS theft.
2. **Strict RBAC Enforcement**: Role checks are performed on the Spring Security filter chain and at controller method level with `@PreAuthorize`.
3. **Data Sanitization & Validation**: Jakarta Bean Validation enforces required fields, coordinates ranges, time consistency (`pickupAvailableUntil` before `consumeBeforeTime`), and meal counts.
4. **Audit Trail**: Every administrative action, donation status transition, and volunteer onboarding event is permanently recorded in the `audit_logs` table.

---

## 📜 License
Developed with ❤️ by the **Sharing Food, Spreading Love** Initiative. Built for community nutrition, zero food waste, and rapid hunger relief.
