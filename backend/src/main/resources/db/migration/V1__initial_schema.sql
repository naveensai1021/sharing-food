-- V1__initial_schema.sql
-- Sharing Food, Spreading Love database schema

-- Enable UUID extension if on PostgreSQL
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES 
('ROLE_SUPPLIER'), 
('ROLE_BENEFICIARY'), 
('ROLE_VOLUNTEER'), 
('ROLE_ADMIN')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    city VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    logo_url TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    onboarded_by_volunteer_id UUID REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    member_role VARCHAR(50) NOT NULL DEFAULT 'PRIMARY_CONTACT',
    CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    street_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(50),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL
);

CREATE TABLE IF NOT EXISTS beneficiary_details (
    organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
    beneficiary_type VARCHAR(50) NOT NULL,
    resident_count INT DEFAULT 0,
    food_capacity_servings INT DEFAULT 0,
    dietary_preferences TEXT
);

CREATE TABLE IF NOT EXISTS volunteer_profiles (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    volunteer_code VARCHAR(50) UNIQUE,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    profile_photo_url TEXT,
    id_proof_url TEXT,
    rejection_reason TEXT,
    verification_submitted_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by_admin_id UUID REFERENCES users(id),
    city VARCHAR(100),
    service_area VARCHAR(255),
    interests TEXT,
    organizations_onboarded_count INT NOT NULL DEFAULT 0,
    donations_assisted_count INT NOT NULL DEFAULT 0,
    activities_completed_count INT NOT NULL DEFAULT 0,
    active_days_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES organizations(id),
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    food_category VARCHAR(50) NOT NULL,
    dietary_type VARCHAR(50) NOT NULL,
    approximate_quantity NUMERIC(10, 2) NOT NULL,
    quantity_unit VARCHAR(50) NOT NULL,
    estimated_servings INT NOT NULL,
    preparation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_available_from TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_available_until TIMESTAMP WITH TIME ZONE NOT NULL,
    consume_before_time TIMESTAMP WITH TIME ZONE NOT NULL,
    pickup_address_id UUID REFERENCES addresses(id),
    packaging_status VARCHAR(255),
    allergens TEXT,
    special_instructions TEXT,
    pickup_instructions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation_food_items (
    id UUID PRIMARY KEY,
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS donation_images (
    id UUID PRIMARY KEY,
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS food_safety_declarations (
    id UUID PRIMARY KEY,
    donation_id UUID UNIQUE NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    supplier_user_id UUID NOT NULL REFERENCES users(id),
    declaration_text TEXT NOT NULL,
    declaration_version VARCHAR(20) NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donation_acceptances (
    id UUID PRIMARY KEY,
    donation_id UUID UNIQUE NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    beneficiary_id UUID NOT NULL REFERENCES organizations(id),
    accepted_by_user_id UUID NOT NULL REFERENCES users(id),
    accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'RESERVED'
);

CREATE TABLE IF NOT EXISTS pickups (
    id UUID PRIMARY KEY,
    donation_id UUID UNIQUE NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    acceptance_id UUID NOT NULL REFERENCES donation_acceptances(id) ON DELETE CASCADE,
    ready_at TIMESTAMP WITH TIME ZONE,
    pickup_started_at TIMESTAMP WITH TIME ZONE,
    collected_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    handover_confirmed_by_supplier BOOLEAN NOT NULL DEFAULT FALSE,
    pickup_notes TEXT
);

CREATE TABLE IF NOT EXISTS donation_status_history (
    id UUID PRIMARY KEY,
    donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    actor_user_id UUID NOT NULL REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    target_url VARCHAR(255),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY,
    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    donation_id UUID REFERENCES donations(id),
    content TEXT NOT NULL,
    city VARCHAR(100),
    tags TEXT,
    likes_count INT NOT NULL DEFAULT 0,
    comments_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_images (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS post_likes (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY,
    reporter_user_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    admin_notes TEXT,
    resolved_by_admin_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteer_leads (
    id UUID PRIMARY KEY,
    volunteer_user_id UUID NOT NULL REFERENCES users(id),
    organization_name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(50) NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteer_activities (
    id UUID PRIMARY KEY,
    volunteer_user_id UUID NOT NULL REFERENCES users(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    hours_spent NUMERIC(4, 2) DEFAULT 1.0,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    ip_address VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    donation_id UUID NOT NULL REFERENCES donations(id),
    reviewer_user_id UUID NOT NULL REFERENCES users(id),
    reviewee_organization_id UUID NOT NULL REFERENCES organizations(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    punctuality_rating INT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    coordination_rating INT CHECK (coordination_rating >= 1 AND coordination_rating <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON addresses(city);
CREATE INDEX IF NOT EXISTS idx_addresses_coords ON addresses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_supplier ON donations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_donations_deadline ON donations(pickup_available_until);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_volunteer_code ON volunteer_profiles(volunteer_code);
CREATE INDEX IF NOT EXISTS idx_volunteer_status ON volunteer_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
