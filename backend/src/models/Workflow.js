const mongoose = require('mongoose');

const transitionSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    allowedRoles: [
        {
            type: String,
            enum: ['Admin', 'Manager', 'Reviewer', 'User'],
        },
    ],
});

const workflowSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Workflow name is required'],
            trim: true,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        states: [
            {
                type: String,
                required: true,
            },
        ],
        transitions: [transitionSchema],
        initialState: {
            type: String,
            required: true,
        },
        finalStates: [
            {
                type: String,
            },
        ],
        isDefault: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Index for tenant-scoped queries
workflowSchema.index({ organization: 1 });

module.exports = mongoose.model('Workflow', workflowSchema);
