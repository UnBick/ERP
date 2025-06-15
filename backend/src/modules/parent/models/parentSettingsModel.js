const mongoose = require('mongoose');

const parentSettingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    general: {
        language: {
            type: String,
            default: 'en'
        },
        timeZone: {
            type: String,
            default: 'UTC'
        },
        dateFormat: {
            type: String,
            default: 'DD/MM/YYYY'
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        }
    },
    notifications: {
        email: {
            enabled: { type: Boolean, default: true },
            frequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' }
        },
        sms: {
            enabled: { type: Boolean, default: false },
        },
        app: {
            enabled: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true }
        }
    },
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        passwordHistory: [{
            password: String,
            changedAt: Date
        }],
        lastPasswordChange: Date,
        passwordExpiry: {
            type: Number,
            default: 90 // days
        },
        strongPassword: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ParentSettings', parentSettingsSchema);
