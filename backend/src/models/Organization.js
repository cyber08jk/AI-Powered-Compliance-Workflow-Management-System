const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Organization name is required'],
            trim: true,
            unique: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        industry: {
            type: String,
            enum: ['Pharma', 'MedTech', 'Manufacturing', 'Other'],
            default: 'Other',
        },
        settings: {
            defaultWorkflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
            slaDefaultDays: { type: Number, default: 7 },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

organizationSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Organization', organizationSchema);
