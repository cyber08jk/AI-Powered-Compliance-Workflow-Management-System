const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get audit logs (tenant-scoped, read-only)
 * @route   GET /api/audit
 * @access  Private (Admin, Manager)
 */
const getAuditLogs = asyncHandler(async (req, res) => {
    const { entity, entityId, action, performedBy, page = 1, limit = 50, startDate, endDate } = req.query;

    const filter = { ...req.tenantScope };

    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = entityId;
    if (action) filter.action = action;
    if (performedBy) filter.performedBy = performedBy;

    if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
        AuditLog.find(filter)
            .populate('performedBy', 'name email role')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        AuditLog.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: logs,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    });
});

/**
 * @desc    Get audit log for a specific entity
 * @route   GET /api/audit/entity/:entity/:entityId
 * @access  Private
 */
const getEntityAuditLog = asyncHandler(async (req, res) => {
    const { entity, entityId } = req.params;

    const logs = await AuditLog.find({
        ...req.tenantScope,
        entity,
        entityId,
    })
        .populate('performedBy', 'name email role')
        .sort({ timestamp: -1 });

    res.json({ success: true, count: logs.length, data: logs });
});

module.exports = { getAuditLogs, getEntityAuditLog };
