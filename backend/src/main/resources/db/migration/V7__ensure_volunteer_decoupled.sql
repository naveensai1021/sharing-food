-- V7__ensure_volunteer_decoupled.sql
-- Ensure organizations.onboarded_by_volunteer_id is completely optional and non-blocking

DO $$
BEGIN
    -- Safely drop NOT NULL constraint if it exists on onboarded_by_volunteer_id
    ALTER TABLE organizations ALTER COLUMN onboarded_by_volunteer_id DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Drop foreign key constraint on onboarded_by_volunteer_id if present so it never blocks organization creation
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'organizations' AND constraint_name = 'organizations_onboarded_by_volunteer_id_fkey'
    ) THEN
        ALTER TABLE organizations DROP CONSTRAINT organizations_onboarded_by_volunteer_id_fkey;
    END IF;
END $$;
