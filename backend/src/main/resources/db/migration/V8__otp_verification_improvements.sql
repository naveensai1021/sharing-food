-- V8__otp_verification_improvements.sql
-- Enhanced OTP Verification, Multi-Channel Delivery, and Audit Challenge Table

-- 1. Ensure timestamp columns on users for verification completion
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE;

-- 2. Dedicated OTP Challenge Table for secure, stateful multi-channel OTP lifecycle
CREATE TABLE IF NOT EXISTS registration_otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_contact VARCHAR(255) NOT NULL,
    verification_method VARCHAR(20) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    resend_available_at TIMESTAMP WITH TIME ZONE NOT NULL,
    consumed_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_user_id ON registration_otp_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_target ON registration_otp_challenges(target_contact);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_expires ON registration_otp_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_created_at ON registration_otp_challenges(created_at);
