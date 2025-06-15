const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    notifications: {
        email: {
            enabled: { type: Boolean, default: true },
            frequency: {
                type: String,
                enum: ['instant', 'daily', 'weekly'],
                default: 'instant'
            },
            types: {
                attendance: { type: Boolean, default: true },
                grades: { type: Boolean, default: true },
                homework: { type: Boolean, default: true },
                events: { type: Boolean, default: true },
                announcements: { type: Boolean, default: true }
            }
        },
        sms: {
            enabled: { type: Boolean, default: false },
            types: {
                attendance: { type: Boolean, default: true },
                emergencies: { type: Boolean, default: true }
            }
        },
        app: {
            enabled: { type: Boolean, default: true },
            types: {
                attendance: { type: Boolean, default: true },
                grades: { type: Boolean, default: true },
                homework: { type: Boolean, default: true },
                events: { type: Boolean, default: true },
                announcements: { type: Boolean, default: true },
                chat: { type: Boolean, default: true }
            }
        }
    },
    general: {
        language: {
            type: String,
            enum: ['en', 'es', 'fr', 'ar'],
            default: 'en'
        },
        timeZone: {
            type: String,
            default: 'UTC'
        },
        dateFormat: {
            type: String,
            enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
            default: 'DD/MM/YYYY'
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        }
    },
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorMethod: {
            type: String,
            enum: ['app', 'sms', 'email'],
            default: 'email'
        },
        passwordExpiry: {
            enabled: { type: Boolean, default: false },
            days: { type: Number, default: 90 }
        },
        strongPassword: {
            type: Boolean,
            default: true
        },
        passwordHistory: [{
            password: String,
            changedAt: {
                type: Date,
                default: Date.now
            }
        }],
        loginHistory: [{
            timestamp: Date,
            ip: String,
            device: String,
            location: String
        }]
    },
    phoneNumber: String
}, {
    timestamps: true
});

// Indexes
settingsSchema.index({ user: 1 }, { unique: true });
settingsSchema.index({ 'security.passwordHistory.changedAt': 1 });

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;