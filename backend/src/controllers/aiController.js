const Issue = require('../models/Issue');
const asyncHandler = require('../utils/asyncHandler');
const { generateSummary } = require('../services/aiService');
const { logAction } = require('../services/auditService');

/**
 * @desc    Generate AI root cause summary for an issue
 * @route   POST /api/ai/summarize/:issueId
 * @access  Private
 */
const generateIssueSummary = asyncHandler(async (req, res) => {
    const issue = await Issue.findOne({ _id: req.params.issueId, ...req.tenantScope });

    if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    // Determine next version number
    const currentVersion = issue.aiSummaries.length > 0
        ? Math.max(...issue.aiSummaries.map((s) => s.version))
        : 0;

    const result = await generateSummary(
        issue.title,
        issue.description,
        issue.category,
        issue.priority
    );

    const newSummary = {
        version: currentVersion + 1,
        summary: result.summary,
        model: result.model,
        generatedAt: new Date(),
    };

    issue.aiSummaries.push(newSummary);
    await issue.save();

    await logAction({
        action: 'AI_SUMMARY_GENERATED',
        entity: 'Issue',
        entityId: issue._id,
        newValue: { version: newSummary.version, model: result.model },
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    res.json({
        success: true,
        data: {
            issueId: issue._id,
            summary: newSummary,
            totalVersions: issue.aiSummaries.length,
        },
    });
});

/**
 * @desc    Get AI summaries for an issue
 * @route   GET /api/ai/summaries/:issueId
 * @access  Private
 */
const getIssueSummaries = asyncHandler(async (req, res) => {
    const issue = await Issue.findOne({ _id: req.params.issueId, ...req.tenantScope });

    if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    res.json({
        success: true,
        data: {
            issueId: issue._id,
            issueTitle: issue.title,
            summaries: issue.aiSummaries.sort((a, b) => b.version - a.version),
        },
    });
});

module.exports = { generateIssueSummary, getIssueSummaries };
