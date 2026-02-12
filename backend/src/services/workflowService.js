const Workflow = require('../models/Workflow');

/**
 * Validate whether a state transition is allowed based on workflow config and user role
 */
const validateTransition = async (organizationId, currentStatus, newStatus, userRole) => {
    const workflow = await Workflow.findOne({
        organization: organizationId,
        isDefault: true,
        isActive: true,
    });

    if (!workflow) {
        throw Object.assign(new Error('No active default workflow found for this organization.'), { statusCode: 400 });
    }

    // Check if the transition exists
    const transition = workflow.transitions.find(
        (t) => t.from === currentStatus && t.to === newStatus
    );

    if (!transition) {
        throw Object.assign(
            new Error(`Transition from '${currentStatus}' to '${newStatus}' is not allowed in the current workflow.`),
            { statusCode: 400 }
        );
    }

    // Check if the user's role is authorized for this transition
    if (transition.allowedRoles.length > 0 && !transition.allowedRoles.includes(userRole)) {
        throw Object.assign(
            new Error(`Role '${userRole}' is not authorized to transition from '${currentStatus}' to '${newStatus}'.`),
            { statusCode: 403 }
        );
    }

    return { workflow, transition };
};

/**
 * Get the initial state for a new issue
 */
const getInitialState = async (organizationId) => {
    const workflow = await Workflow.findOne({
        organization: organizationId,
        isDefault: true,
        isActive: true,
    });

    if (!workflow) {
        return 'Draft'; // Fallback default
    }

    return workflow.initialState;
};

/**
 * Check if a status is a final state
 */
const isFinalState = async (organizationId, status) => {
    const workflow = await Workflow.findOne({
        organization: organizationId,
        isDefault: true,
        isActive: true,
    });

    if (!workflow) return false;
    return workflow.finalStates.includes(status);
};

module.exports = { validateTransition, getInitialState, isFinalState };
