const Workflow = require('../models/Workflow');
const asyncHandler = require('../utils/asyncHandler');
const { logAction } = require('../services/auditService');

/**
 * @desc    Create a new workflow
 * @route   POST /api/workflows
 * @access  Private (Admin)
 */
const createWorkflow = asyncHandler(async (req, res) => {
    const { name, states, transitions, initialState, finalStates, isDefault } = req.body;

    // Validate that initialState is in states
    if (!states.includes(initialState)) {
        return res.status(400).json({
            success: false,
            message: 'initialState must be one of the defined states.',
        });
    }

    // Validate that finalStates are in states
    if (finalStates && finalStates.some((s) => !states.includes(s))) {
        return res.status(400).json({
            success: false,
            message: 'All finalStates must be in the defined states.',
        });
    }

    // Validate transitions
    if (transitions) {
        for (const t of transitions) {
            if (!states.includes(t.from) || !states.includes(t.to)) {
                return res.status(400).json({
                    success: false,
                    message: `Transition from '${t.from}' to '${t.to}' references undefined states.`,
                });
            }
        }
    }

    // If this is set as default, unset other defaults for this org
    if (isDefault) {
        await Workflow.updateMany(
            { organization: req.tenantId, isDefault: true },
            { isDefault: false }
        );
    }

    const workflow = await Workflow.create({
        name,
        organization: req.tenantId,
        states,
        transitions,
        initialState,
        finalStates: finalStates || [],
        isDefault: isDefault || false,
    });

    await logAction({
        action: 'CREATE',
        entity: 'Workflow',
        entityId: workflow._id,
        newValue: { name, states, transitions },
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    res.status(201).json({ success: true, data: workflow });
});

/**
 * @desc    Get all workflows for the organization
 * @route   GET /api/workflows
 * @access  Private
 */
const getWorkflows = asyncHandler(async (req, res) => {
    const workflows = await Workflow.find({ ...req.tenantScope });

    res.json({ success: true, count: workflows.length, data: workflows });
});

/**
 * @desc    Get single workflow
 * @route   GET /api/workflows/:id
 * @access  Private
 */
const getWorkflow = asyncHandler(async (req, res) => {
    const workflow = await Workflow.findOne({ _id: req.params.id, ...req.tenantScope });

    if (!workflow) {
        return res.status(404).json({ success: false, message: 'Workflow not found.' });
    }

    res.json({ success: true, data: workflow });
});

/**
 * @desc    Update a workflow
 * @route   PUT /api/workflows/:id
 * @access  Private (Admin)
 */
const updateWorkflow = asyncHandler(async (req, res) => {
    const workflow = await Workflow.findOne({ _id: req.params.id, ...req.tenantScope });

    if (!workflow) {
        return res.status(404).json({ success: false, message: 'Workflow not found.' });
    }

    const previousValue = {
        name: workflow.name,
        states: workflow.states,
        transitions: workflow.transitions,
    };

    const { name, states, transitions, initialState, finalStates, isDefault, isActive } = req.body;

    if (name) workflow.name = name;
    if (states) workflow.states = states;
    if (transitions) workflow.transitions = transitions;
    if (initialState) workflow.initialState = initialState;
    if (finalStates) workflow.finalStates = finalStates;
    if (isDefault !== undefined) {
        if (isDefault) {
            await Workflow.updateMany(
                { organization: req.tenantId, isDefault: true, _id: { $ne: workflow._id } },
                { isDefault: false }
            );
        }
        workflow.isDefault = isDefault;
    }
    if (isActive !== undefined) workflow.isActive = isActive;

    await workflow.save();

    await logAction({
        action: 'UPDATE',
        entity: 'Workflow',
        entityId: workflow._id,
        previousValue,
        newValue: { name: workflow.name, states: workflow.states, transitions: workflow.transitions },
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    res.json({ success: true, data: workflow });
});

/**
 * @desc    Delete a workflow
 * @route   DELETE /api/workflows/:id
 * @access  Private (Admin)
 */
const deleteWorkflow = asyncHandler(async (req, res) => {
    const workflow = await Workflow.findOne({ _id: req.params.id, ...req.tenantScope });

    if (!workflow) {
        return res.status(404).json({ success: false, message: 'Workflow not found.' });
    }

    if (workflow.isDefault) {
        return res.status(400).json({ success: false, message: 'Cannot delete the default workflow.' });
    }

    await logAction({
        action: 'DELETE',
        entity: 'Workflow',
        entityId: workflow._id,
        previousValue: { name: workflow.name },
        performedBy: req.user._id,
        organization: req.tenantId,
    });

    await Workflow.findByIdAndDelete(workflow._id);

    res.json({ success: true, message: 'Workflow deleted successfully.' });
});

module.exports = { createWorkflow, getWorkflows, getWorkflow, updateWorkflow, deleteWorkflow };
