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
            frequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'instant' }
        },
        push: {
            enabled: { type: Boolean, default: true },
            types: {
                assignments: { type: Boolean, default: true },
                attendance: { type: Boolean, default: true },
                grades: { type: Boolean, default: true },
                announcements: { type: Boolean, default: true }
            }
        }
    },
    general: {
        language: { type: String, default: 'en' },
        theme: { type: String, default: 'light' },
        timezone: String,
        dateFormat: { type: String, default: 'DD/MM/YYYY' }
    },
    security: {
        twoFactorEnabled: { type: Boolean, default: false },
        securityQuestions: [{
            question: String,
            answer: String
        }],
        passwordHistory: [{
            password: String,
            changedAt: Date
        }]
    }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = Settings;