const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    general: {
        schoolName: { type: String, default: 'School Name' },
        address: { type: String },
        phoneNumber: { type: String },
        email: { type: String },
        website: { type: String },
        taxNumber: { type: String },
        registrationNumber: { type: String },
        academicYear: { type: String },
        timezone: { type: String, default: 'UTC' },
        dateFormat: { type: String, default: 'DD/MM/YYYY' },
        currency: { type: String, default: 'INR' },
        language: { type: String, default: 'en' }
    },
    appearance: {
        logo: { type: String },
        theme: { type: String, default: 'light' },
        themeColor: { type: String, default: '#1976d2' }
    },
    lastUpdated: {
        by: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: false,
            default: null
        },
        date: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
