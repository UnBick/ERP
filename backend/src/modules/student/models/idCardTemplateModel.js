const mongoose = require('mongoose');

const idCardTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['student', 'staff', 'visitor', 'idcard', 'reportcard', 'certificate', 'admission'], // Added new types
        default: 'idcard'
    },
    description: {
        type: String
    },
    template: {
        html: {
            type: String,
            required: true
        },
        css: {
            type: String,
            required: true
        }
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String,
        default: '/images/templates/default-thumb.png'
    },
    preview: {
        type: String,
        default: '/images/templates/default-preview.png'
    },
    version: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp on save
idCardTemplateSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const IdCardTemplate = mongoose.model('IdCardTemplate', idCardTemplateSchema);
module.exports = IdCardTemplate;
