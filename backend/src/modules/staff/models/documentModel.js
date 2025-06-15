const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['identification', 'qualification', 'contract', 'other']
    },
    name: {
        type: String,
        required: true
    },
    fileDetails: {
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    metadata: {
        documentNumber: String,
        issueDate: Date,
        expiryDate: Date,
        issuingAuthority: String
    },
    verification: {
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        },
        verificationDate: Date,
        comments: String
    },
    permissions: {
        canView: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        }],
        canEdit: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'
        }]
    },
    tags: [String],
    version: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

documentSchema.index({ staffId: 1, category: 1 });
documentSchema.index({ 'fileDetails.fileName': 'text' });

module.exports = mongoose.model('StaffDocument', documentSchema);