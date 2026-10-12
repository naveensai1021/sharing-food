-- V5__remove_volunteer_role_and_add_admin_approval.sql
-- Mandatory Admin Approval Workflow & Complete Volunteer Role Removal

-- 1. Add Admin Approval and Review tracking columns to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status_reason TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by_admin_id UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- 2. Migrate existing user statuses to the new approval schema
-- Active accounts are considered approved
UPDATE users 
SET status = 'APPROVED' 
WHERE status = 'ACTIVE';

-- Any pending verification accounts are migrated to pending approval
UPDATE users 
SET status = 'PENDING_APPROVAL' 
WHERE status = 'PENDING_VERIFICATION';

-- Update default status for new registrations to PENDING_APPROVAL
ALTER TABLE users 
    ALTER COLUMN status SET DEFAULT 'PENDING_APPROVAL';

-- 3. Add registration licensing and document verification fields to organizations
ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS document_url TEXT;

-- 4. Safely remove ROLE_VOLUNTEER from user_roles and roles
DELETE FROM user_roles 
WHERE role_id IN (SELECT id FROM roles WHERE name = 'ROLE_VOLUNTEER');

DELETE FROM roles 
WHERE name = 'ROLE_VOLUNTEER';

-- 5. Safe indexes for approval filtering
CREATE INDEX IF NOT EXISTS idx_users_status_approval ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_reviewed_at ON users(reviewed_at);
