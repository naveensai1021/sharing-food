# Sharing Food, Spreading Love – NGO Food Rescue Platform

A production-grade, enterprise full-stack platform connecting food donors (restaurants, caterers, banquet halls, bakeries) with nearby beneficiaries (old-age homes, orphanages, community shelters) through mandatory administrative approval, rigorous food safety declarations, real-time same-day rescue workflows, and administrative governance.

---

## 🌟 Governing Architecture & Roles

The platform strictly supports three authorized roles:

1. **`ROLE_SUPPLIER` (Food Donors)**:
   - Registers with restaurant/storefront photo, full address, GPS coordinates, and FSSAI / Food Business License Number.
   - Defaults to **`PENDING_APPROVAL`** upon signup.
   - Gains ability to publish surplus food listings and verify beneficiary 6-digit pickup OTPs once **`APPROVED`** by an administrator.

2. **`ROLE_BENEFICIARY` (Care Organizations)**:
   - Registers as an orphanage, old-age home, or community shelter with facility photograph, address coordinates, resident count, food capacity, and NGO / Society / Trust registration details.
   - Defaults to **`PENDING_APPROVAL`** upon signup.
   - Gains ability to search nearby food, reserve donations with concurrency locks, and receive secure pickup OTPs once **`APPROVED`** by an administrator.

3. **`ROLE_ADMIN` (Platform Governance)**:
   - System administrator accounts provisioned securely (not open to public registration).
   - Reviews pending supplier and beneficiary applications in `/admin/users`.
   - Approves, rejects (with mandatory reason), or suspends (with mandatory reason) accounts with full audit logging and in-app notifications.
   - Monitors platform KPIs, active donations, and completed food handovers on `/admin/dashboard`.

### Mandatory Admin Approval & Account Statuses
* **Account Status Lifecycle**:
  - `PENDING_APPROVAL`: Default for all new registrations. Users can log in to view their `/account-status` page but cannot execute operational food actions.
  - `APPROVED`: Activated by admin review; operational capabilities unlocked.
  - `REJECTED`: Application declined by admin with a mandatory feedback reason displayed on `/account-status`.
  - `SUSPENDED`: Temporarily deactivated by admin with mandatory compliance reason recorded.
* **Email Verification**: Confirms email address ownership via 6-digit code or link, but **never automatically approves** an account.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries & Specifications |
|---|---|---|
| **Backend** | Java 21, Spring Boot 3.3.4 | Spring Security 6, Spring Data JPA, Hibernate ORM, Bean Validation (Jakarta) |
| **Authentication** | JWT + HttpOnly Cookies | Role-Based Access Control (`ROLE_ADMIN`, `ROLE_SUPPLIER`, `ROLE_BENEFICIARY`) |
| **Database** | PostgreSQL 16 (H2 in Test Profile) | Flyway Migrations, UUID Primary Keys, Pessimistic Row Locking, Geospatial Indexes |
| **Frontend** | Next.js 14.2 (App Router), React 18 | TypeScript, Tailwind CSS, Lucide Icons, Sonner Toasts, Leaflet Maps, Recharts |
| **DevOps** | Docker, Docker Compose, Maven Wrapper | Multi-stage Docker builds, PostgreSQL health checks |

---

## 🔑 Pre-Seeded Demonstration Accounts

For evaluation and demonstration, the backend `DataSeeder` automatically provisions seed accounts across all supported roles and statuses:

| Role / Status | Email Address | Password | Profile Description |
|---|---|---|---|
| **App Admin** | `admin@sharingfood.org` | `Admin@123` | System Administrator (Full Governance & Approvals) |
| **Approved Supplier** | `supplier1@sharingfood.org` | `Password@123` | Grand Banquet Kitchens (Approved & Active) |
| **Approved Beneficiary** | `beneficiary1@sharingfood.org` | `Password@123` | Hope Old Age Home (Approved & Active) |
| **Pending Supplier** | `pending.supplier@sharingfood.org` | `Password@123` | Royal Caterers (Pending Administrator Review) |
| **Pending Beneficiary** | `pending.beneficiary@sharingfood.org` | `Password@123` | Sunshine Children Home (Pending Administrator Review) |
| **Rejected Supplier** | `rejected.supplier@sharingfood.org` | `Password@123` | Invalid Kitchens (Rejected with review reason) |
| **Suspended Supplier** | `suspended.supplier@sharingfood.org` | `Password@123` | Suspended Caterers (Suspended with compliance reason) |

---

## 🚀 Getting Started

### Option 1: Run with Docker Compose

```bash
docker-compose up -d --build
```

* **Frontend Web App**: http://localhost:3000
* **Backend REST API**: http://localhost:8080
* **PostgreSQL Database**: `localhost:5432` (`sharingfood` / `postgres` / `postgres`)

---

## 🛡️ Security & Concurrency

1. **HttpOnly Cookie Tokens**: Tokens are delivered in secure HttpOnly cookies (`SF_AUTH_TOKEN`) preventing JavaScript access and XSS theft.
2. **Double Acceptance Concurrency Shield**: Spring Data JPA `@Lock(LockModeType.PESSIMISTIC_WRITE)` prevents race conditions when multiple beneficiaries claim food simultaneously.
3. **Operational Endpoint Guards**: All donation and pickup endpoints enforce an active, approved account status, rejecting unapproved accounts with `HTTP 403 Forbidden`.
4. **Permanent Audit Trail**: All administrator approval, rejection, and suspension decisions are permanently recorded in the `audit_logs` table with administrator ID, timestamp, and reason.

---

## 📜 License
Developed with ❤️ by the **Sharing Food, Spreading Love** Initiative. Built for community nutrition, zero food waste, and rapid hunger relief.
