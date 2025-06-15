const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    },
    phones: [{
        number: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['main', 'admission', 'accounts', 'transport', 'other'],
            default: 'main'
        },
        description: String
    }],
    emails: [{
        address: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['general', 'admission', 'support', 'other'],
            default: 'general'
        },
        description: String
    }],
    location: {
        lat: Number,
        lng: Number,
        mapUrl: String
    },
    socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        youtube: String
    },
    workingHours: [{
        day: String,
        hours: String,
        isOpen: Boolean
    }],
    lastUpdated: {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactInfo', contactInfoSchema);