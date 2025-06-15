const mongoose = require('mongoose');

const scholarBadgeSchema = new mongoose.Schema({
    criteria: {
        academicScore: {
            minimum: Number,
            subjects: [{
                name: String,
                minScore: Number
            }]
        },
        attendance: {
            minimum: Number
        },
        extraCurricular: {
            points: Number,
            activities: [{
                type: String,
                points: Number
            }]
        }
    },
    recipients: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        year: String,
        score: {
            academic: Number,
            attendance: Number,
            extraCurricular: Number
        },
        awardedDate: Date
    }],
    academicYear: {
        type: String,
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('ScholarBadge', scholarBadgeSchema);