const Issue = require('../models/Issue');
const asyncHandler = require('../utils/asyncHandler');
const { logAction } = require('../services/auditService');
const { validateTransition, getInitialState, isFinalState } = require('../services/workflowService');

/**
 * @desc    Create a new issue
 * @route   POST /api/issues
 * @access  Private
 */
const createIssue = asyncHandler(async (req, res) => {
    const { title, description, category, priority, assignedTo, dueDate } = req.body;

    const initialState = await getInitialState(req.tenantId);

    const issue = await Issue.create({
        title,
        description,
        category,
        priority,
        status: initialState,
        assignedTo,
        createdBy: req.user._id,
        organization: req.tenantId,
        dueDate,
    });

    await logAction({
        action: 'CREATE',
        entity: 'Issue',
        entityId: issue._id,
        newValue: { title, status: initialState, category, priority },
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
        io.to(`tenant-${req.tenantId}`).emit('issue:created', issue);
    }

    const populated = await Issue.findById(issue._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

    res.status(201).json({ success: true, data: populated });
});

/**
 * @desc    Get all issues (tenant-scoped)
 * @route   GET /api/issues
 * @access  Private
 */
const getIssues = asyncHandler(async (req, res) => {
    const { status, category, priority, assignedTo, slaBreached, page = 1, limit = 20, search } = req.query;

    const filter = { ...req.tenantScope };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (slaBreached !== undefined) filter.slaBreached = slaBreached === 'true';
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [issues, total] = await Promise.all([
        Issue.find(filter)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Issue.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: issues,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    });
});

/**
 * @desc    Get single issue by ID
 * @route   GET /api/issues/:id
 * @access  Private
 */
const getIssue = asyncHandler(async (req, res) => {
    const issue = await Issue.findOne({ _id: req.params.id, ...req.tenantScope })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

    if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    res.json({ success: true, data: issue });
});

/**
 * @desc    Update an issue (general fields, not status)
 * @route   PUT /api/issues/:id
 * @access  Private
 */
const updateIssue = asyncHandler(async (req, res) => {
    const issue = await Issue.findOne({ _id: req.params.id, ...req.tenantScope });

    if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    const allowedFields = ['title', 'description', 'category', 'priority', 'assignedTo', 'dueDate'];
    const previousValue = {};
    const newValue = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            previousValue[field] = issue[field];
            newValue[field] = req.body[field];
            issue[field] = req.body[field];
        }
    });

    await issue.save();

    await logAction({
        action: 'UPDATE',
        entity: 'Issue',
        entityId: issue._id,
        previousValue,
        newValue,
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    const io = req.app.get('io');
    if (io) {
        io.to(`tenant-${req.tenantId}`).emit('issue:updated', issue);
    }

    const populated = await Issue.findById(issue._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

    res.json({ success: true, data: populated });
});

/**
 * @desc    Transition issue status (workflow-aware)
 * @route   PATCH /api/issues/:id/transition
 * @access  Private
 */
const transitionIssue = asyncHandler(async (req, res) => {
    const { newStatus } = req.body;

    if (!newStatus) {
        return res.status(400).json({ success: false, message: 'newStatus is required.' });
    }

    const issue = await Issue.findOne({ _id: req.params.id, ...req.tenantScope });

    if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    // Validate transition
    await validateTransition(req.tenantId, issue.status, newStatus, req.user.role);

    const previousStatus = issue.status;
    issue.status = newStatus;

    // If transitioning to a final state, record resolution time
    const final = await isFinalState(req.tenantId, newStatus);
    if (final && !issue.resolvedAt) {
        issue.resolvedAt = new Date();
    }

    await issue.save();

    await logAction({
        action: 'WORKFLOW_TRANSITION',
        entity: 'Issue',
        entityId: issue._id,
        previousValue: { status: previousStatus },
        newValue: { status: newStatus },
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    const io = req.app.get('io');
    if (io) {
        io.to(`tenant-${req.tenantId}`).emit('issue:transitioned', {
            issueId: issue._id,
            previousStatus,
            newStatus,
            performedBy: req.user.name,
        });
    }

    const populated = await Issue.findById(issue._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

    res.json({ success: true, data: populated });
});

/**
 * @desc    Delete an issue
 * @route   DELETE /api/issues/:id
 * @access  Private (Admin, Manager)
 */
const deleteIssue = asyncHandler(async (req, res) => {
    const issue = await Issue.findOne({ _id: req.params.id, ...req.tenantScope });

    if (!issue) {
        return res.status(404).json({ success: false, message: 'Issue not found.' });
    }

    await logAction({
        action: 'DELETE',
        entity: 'Issue',
        entityId: issue._id,
        previousValue: { title: issue.title, status: issue.status },
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    await Issue.findByIdAndDelete(issue._id);

    const io = req.app.get('io');
    if (io) {
        io.to(`tenant-${req.tenantId}`).emit('issue:deleted', { issueId: issue._id });
    }

    res.json({ success: true, message: 'Issue deleted successfully.' });
});

module.exports = { createIssue, getIssues, getIssue, updateIssue, transitionIssue, deleteIssue };
