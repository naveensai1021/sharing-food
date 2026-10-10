-- V4__fix_email_and_directory_contacts.sql
-- Add last_verification_sent_at and backfill public contact numbers

ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS last_verification_sent_at TIMESTAMP WITH TIME ZONE;

-- Backfill public_phone from contact_phone for all organizations where public_phone is empty or null
UPDATE organizations
SET public_phone = contact_phone
WHERE public_phone IS NULL OR TRIM(public_phone) = '';

-- Ensure all existing organizations have a valid formatted phone
UPDATE organizations
SET public_phone = '+91 40 2345 1000'
WHERE public_phone IS NULL OR TRIM(public_phone) = '';
