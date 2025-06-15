const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    occupation: {
        type: String,
        trim: true
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    preferences: {
        language: {
            type: String,
            default: 'en'
        },
        timeZone: {
            type: String,
            default: 'UTC'
        },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            app: { type: Boolean, default: true }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure proper indexes
parentSchema.index({ email: 1 });
parentSchema.index({ 'children': 1 });
parentSchema.index({ isActive: 1 });

const Parent = mongoose.models.Parent || mongoose.model('Parent', parentSchema);

module.exports = Parent;