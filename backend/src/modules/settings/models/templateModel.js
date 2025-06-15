const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: [
            'REPORT_CARD',
            'TRANSFER_CERT',
            'ID_CARD',
            'CHARACTER_CERT',
            'EMAIL_TEMPLATE',
            'SMS_TEMPLATE',
            'NOTIFICATION',
            'ADMISSION_FORM',
            'FEE_RECEIPT',
            'MARKSHEET',
            'BONAFIDE_CERT'
        ],
        required: true
    },
    description: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['academic', 'administrative', 'communication', 'finance'],
        required: true
    },
    templateImage: {
        url: String,
        publicId: String
    },
    previewImage: {
        url: String,
        publicId: String
    },
    htmlContent: String,
    cssContent: String,
    variables: [{
        key: String,
        label: String,
        type: String,
        required: Boolean,
        defaultValue: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastModified: {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for missing required templates
templateSchema.statics.getMissingRequiredTemplates = async function() {
    const requiredTemplates = [
        { type: 'REPORT_CARD', category: 'academic' },
        { type: 'ID_CARD', category: 'administrative' },
        { type: 'FEE_RECEIPT', category: 'finance' },
        // Add more required templates here
    ];

    const existingTemplates = await this.find({
        type: { $in: requiredTemplates.map(t => t.type) },
        status: 'active'
    });

    return requiredTemplates.filter(required => 
        !existingTemplates.some(existing => existing.type === required.type)
    );
};

module.exports = mongoose.models.Template || mongoose.model('Template', templateSchema);