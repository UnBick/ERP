const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true,
        trim: true
    },
    logo: {
        main: String,
        footer: String,
        favicon: String
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String],
        ogImage: String
    },
    theme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theme'
    },
    analytics: {
        googleAnalyticsId: String,
        enableTracking: Boolean
    },
    social: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        youtube: String
    },
    features: {
        newsletter: {
            enabled: Boolean,
            mailchimpKey: String,
            listId: String
        },
        contact: {
            enableRecaptcha: Boolean,
            recaptchaKey: String
        }
    },
    lastUpdated: {
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);