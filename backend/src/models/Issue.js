const mongoose = require('mongoose');

const aiSummarySchema = new mongoose.Schema({
    version: { type: Number, required: true },
    summary: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    model: { type: String, default: 'gpt-3.5-turbo' },
});

const issueSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Issue title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Issue description is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: ['Quality', 'Safety', 'Regulatory', 'Environmental', 'Operational', 'Other'],
        },
        priority: {
            type: String,
            enum: ['Critical', 'High', 'Medium', 'Low'],
            default: 'Medium',
        },
        status: {
            type: String,
            default: 'Draft',
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date (SLA) is required'],
        },
        slaBreached: {
            type: Boolean,
            default: false,
        },
        slaBreachedAt: {
            type: Date,
        },
        resolvedAt: {
            type: Date,
        },
        aiSummaries: [aiSummarySchema],
        attachments: [
            {
                filename: String,
                url: String,
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Index for tenant-scoped queries
issueSchema.index({ organization: 1, status: 1 });
issueSchema.index({ organization: 1, dueDate: 1, slaBreached: 1 });

module.exports = mongoose.model('Issue', issueSchema);
