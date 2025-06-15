const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    email: {
        type: Boolean,
        default: true
    },
    sms: {
        type: Boolean,
        default: false
    },
    assignments: {
        email: Boolean,
        push: Boolean,
        frequency: {
            type: String,
            enum: ['immediate', 'daily', 'weekly']
        }
    },
    grades: {
        email: Boolean,
        push: Boolean,
        frequency: String
    },
    announcements: {
        email: Boolean,
        push: Boolean,
        frequency: String
    },
    reminders: {
        email: Boolean,
        push: Boolean,
        frequency: String
    }
}, { timestamps: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);