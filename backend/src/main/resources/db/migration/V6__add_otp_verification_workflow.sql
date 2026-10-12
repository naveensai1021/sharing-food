-- V6__add_otp_verification_workflow.sql
-- OTP Verification, Signup Retry, and Admin Approval Workflow

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_method VARCHAR(20) DEFAULT 'EMAIL',
    ADD COLUMN IF NOT EXISTS resend_count INT NOT NULL DEFAULT 0;

-- Update default status for new registrations to PENDING_OTP_VERIFICATION
ALTER TABLE users 
    ALTER COLUMN status SET DEFAULT 'PENDING_OTP_VERIFICATION';

-- Add index on users(phone_verified)
CREATE INDEX IF NOT EXISTS idx_users_phone_verified ON users(phone_verified);
CREATE INDEX IF NOT EXISTS idx_users_verification_method ON users(verification_method);
