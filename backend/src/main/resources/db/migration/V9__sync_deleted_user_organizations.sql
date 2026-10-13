-- Sync organizations active flag with user deletion status
-- When a user is deleted, their associated organization must be deactivated so it no longer appears in directories or impact analytics

UPDATE organizations
SET is_active = FALSE
WHERE id IN (
    SELECT om.organization_id
    FROM organization_members om
    JOIN users u ON om.user_id = u.id
    WHERE u.status = 'DELETED'
);

-- Also deactivate any organization that has no active, verified user attached
UPDATE organizations
SET is_active = FALSE
WHERE id NOT IN (
    SELECT om.organization_id
    FROM organization_members om
    JOIN users u ON om.user_id = u.id
    WHERE u.status != 'DELETED' AND u.status != 'PENDING_OTP_VERIFICATION'
);
