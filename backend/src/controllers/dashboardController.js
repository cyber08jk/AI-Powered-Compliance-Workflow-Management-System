const Issue = require('../models/Issue');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get dashboard analytics (tenant-scoped)
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const tenantFilter = { organization: req.tenantId };

    // Run all aggregations in parallel
    const [
        totalIssues,
        statusBreakdown,
        priorityBreakdown,
        categoryBreakdown,
        slaStats,
        resolutionTimeStats,
        recentIssues,
        monthlyTrend,
    ] = await Promise.all([
        // Total issues
        Issue.countDocuments(tenantFilter),

        // Issues by status (for pie chart)
        Issue.aggregate([
            { $match: tenantFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),

        // Issues by priority
        Issue.aggregate([
            { $match: tenantFilter },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),

        // Issues by category
        Issue.aggregate([
            { $match: tenantFilter },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),

        // SLA breach statistics
        Issue.aggregate([
            { $match: tenantFilter },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    breached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
                    onTrack: { $sum: { $cond: ['$slaBreached', 0, 1] } },
                },
            },
        ]),

        // Average resolution time (for resolved issues)
        Issue.aggregate([
            { $match: { ...tenantFilter, resolvedAt: { $exists: true, $ne: null } } },
            {
                $project: {
                    resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] },
                },
            },
            {
                $group: {
                    _id: null,
                    avgResolutionMs: { $avg: '$resolutionTime' },
                    count: { $sum: 1 },
                },
            },
        ]),

        // Recent issues (last 5)
        Issue.find(tenantFilter)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(5),

        // Monthly trend (last 6 months)
        Issue.aggregate([
            {
                $match: {
                    ...tenantFilter,
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
    ]);

    // Format SLA stats
    const sla = slaStats[0] || { total: 0, breached: 0, onTrack: 0 };
    const slaBreachPercentage = sla.total > 0
        ? ((sla.breached / sla.total) * 100).toFixed(1)
        : 0;

    // Format resolution time
    const avgResolution = resolutionTimeStats[0]
        ? {
            avgHours: (resolutionTimeStats[0].avgResolutionMs / (1000 * 60 * 60)).toFixed(1),
            avgDays: (resolutionTimeStats[0].avgResolutionMs / (1000 * 60 * 60 * 24)).toFixed(1),
            resolvedCount: resolutionTimeStats[0].count,
        }
        : { avgHours: 0, avgDays: 0, resolvedCount: 0 };

    res.json({
        success: true,
        data: {
            totalIssues,
            statusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
            priorityBreakdown: priorityBreakdown.map((p) => ({ priority: p._id, count: p.count })),
            categoryBreakdown: categoryBreakdown.map((c) => ({ category: c._id, count: c.count })),
            sla: {
                total: sla.total,
                breached: sla.breached,
                onTrack: sla.onTrack,
                breachPercentage: parseFloat(slaBreachPercentage),
            },
            avgResolutionTime: avgResolution,
            recentIssues,
            monthlyTrend: monthlyTrend.map((m) => ({
                year: m._id.year,
                month: m._id.month,
                count: m.count,
            })),
        },
    });
});

module.exports = { getDashboardStats };
