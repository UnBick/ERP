const mongoose = require('mongoose');

const studentSettingsSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true
    },
    preferredLanguage: {
        type: String,
        default: 'en'
    },
    timezone: {
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
    },
    fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
    },
    accessibility: {
        highContrast: { type: Boolean, default: false },
        reduceMotion: { type: Boolean, default: false },
        screenReader: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Export with a different model name
module.exports = mongoose.models.StudentSettings || mongoose.model('StudentSettings', studentSettingsSchema);