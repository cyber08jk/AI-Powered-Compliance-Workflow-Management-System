const AuditLog = require('../models/AuditLog');

/**
 * Create an immutable audit log entry
 */
const logAction = async ({ action, entity, entityId, previousValue, newValue, performedBy, organization, ipAddress, userAgent }) => {
    try {
        await AuditLog.create({
            action,
            entity,
            entityId,
            previousValue: previousValue || null,
            newValue: newValue || null,
            performedBy,
            organization,
            ipAddress: ipAddress || '',
            userAgent: userAgent || '',
        });
    } catch (error) {
        console.error('[AuditService] Failed to log action:', error.message);
        // Non-blocking — audit failures should not break the main flow
    }
};

module.exports = { logAction };
