package org.sharingfood.service;

import org.sharingfood.entity.AuditLog;
import org.sharingfood.entity.User;
import org.sharingfood.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(UUID actorUserId, String action, String resourceType, UUID resourceId, String ipAddress, String details) {
        try {
            AuditLog log = new AuditLog(actorUserId, action, resourceType, resourceId, ipAddress, details);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Keep going even if audit logging fails
        }
    }

    public void log(UUID actorUserId, String action, String resourceType, UUID resourceId, String details) {
        log(actorUserId, action, resourceType, resourceId, null, details);
    }

    public void log(User actorUser, String action, String resourceType, UUID resourceId, String details) {
        log(actorUser != null ? actorUser.getId() : null, action, resourceType, resourceId, null, details);
    }
}
