const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: [true, 'Action is required'],
            enum: [
                'CREATE',
                'UPDATE',
                'DELETE',
                'STATUS_CHANGE',
                'ASSIGNMENT',
                'WORKFLOW_TRANSITION',
                'AI_SUMMARY_GENERATED',
                'SLA_BREACH',
                'LOGIN',
                'REGISTER',
            ],
        },
        entity: {
            type: String,
            required: true,
            enum: ['Issue', 'Workflow', 'User', 'Organization'],
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        previousValue: {
            type: mongoose.Schema.Types.Mixed,
        },
        newValue: {
            type: mongoose.Schema.Types.Mixed,
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        ipAddress: {
            type: String,
        },
        userAgent: {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
            immutable: true,
        },
    },
    {
        timestamps: false,
        // Prevent updates and deletes at the schema level
        strict: true,
    }
);

// Make the entire document immutable after creation
auditLogSchema.pre('findOneAndUpdate', function () {
    throw new Error('Audit logs are immutable and cannot be updated');
});

auditLogSchema.pre('updateOne', function () {
    throw new Error('Audit logs are immutable and cannot be updated');
});

auditLogSchema.pre('updateMany', function () {
    throw new Error('Audit logs are immutable and cannot be updated');
});

auditLogSchema.pre('findOneAndDelete', function () {
    throw new Error('Audit logs are immutable and cannot be deleted');
});

auditLogSchema.pre('deleteOne', function () {
    throw new Error('Audit logs are immutable and cannot be deleted');
});

auditLogSchema.pre('deleteMany', function () {
    throw new Error('Audit logs are immutable and cannot be deleted');
});

// Index for efficient queries
auditLogSchema.index({ organization: 1, timestamp: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
