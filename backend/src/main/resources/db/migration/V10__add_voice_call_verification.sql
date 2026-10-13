-- V10__add_voice_call_verification.sql
-- Automated Voice Call Verification (IVR) Schema

-- 1. Add voice verification status flags to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS voice_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS voice_verified_at TIMESTAMP WITH TIME ZONE;

-- 2. Enhance registration_otp_challenges for IVR Voice Call workflow
ALTER TABLE registration_otp_challenges
    ADD COLUMN IF NOT EXISTS provider_call_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS call_status VARCHAR(50) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS verification_result VARCHAR(50) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS dtmf_digit VARCHAR(10),
    ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMP WITH TIME ZONE;

-- 3. Indexes for fast provider webhook lookups and status polling
CREATE INDEX IF NOT EXISTS idx_otp_challenges_call_id ON registration_otp_challenges(provider_call_id);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_result ON registration_otp_challenges(verification_result);
