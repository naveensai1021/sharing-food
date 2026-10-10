-- Migration to add missing volunteer profile fields
ALTER TABLE volunteer_profiles 
    ADD COLUMN IF NOT EXISTS id_proof_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS id_proof_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS organizations_contacted_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS activities_completed_count INT NOT NULL DEFAULT 0;
