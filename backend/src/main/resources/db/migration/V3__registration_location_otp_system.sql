-- V3__registration_location_otp_system.sql
-- Complete Registration, Location, Contact, and OTP Verification System

-- 1. Users: Email verification tracking
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(100),
    ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS verification_attempts INT NOT NULL DEFAULT 0;

-- Existing initial/seeded users should be considered email verified
UPDATE users SET email_verified = TRUE WHERE email_verified IS FALSE;

-- 2. Organizations: Storefront / Premises photo and public contact details
ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS public_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS show_public_phone BOOLEAN NOT NULL DEFAULT TRUE;

-- 3. Addresses: Area / Locality field
ALTER TABLE addresses
    ADD COLUMN IF NOT EXISTS area_locality VARCHAR(150);

-- 4. Donation Acceptances: Request workflow fields
ALTER TABLE donation_acceptances
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS requested_servings INT;

-- 5. Pickups: Secure OTP verification and handover completion
ALTER TABLE pickups
    ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255),
    ADD COLUMN IF NOT EXISTS encrypted_otp VARCHAR(255),
    ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS otp_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS otp_used BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS confirmed_servings INT,
    ADD COLUMN IF NOT EXISTS handover_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_email_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_pickups_otp_expires ON pickups(otp_expires_at);
