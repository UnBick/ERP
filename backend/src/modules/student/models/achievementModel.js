const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ['academic', 'sports', 'cultural', 'other'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    level: {
        type: String,
        enum: ['class', 'school', 'district', 'state', 'national', 'international']
    },
    position: String,
    certificate: String,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    points: Number,
    images: [String]
}, { timestamps: true });

achievementSchema.index({ student: 1 });
achievementSchema.index({ category: 1, date: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);