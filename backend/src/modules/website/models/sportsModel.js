const mongoose = require('mongoose');

const sportsSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['indoor', 'outdoor', 'athletics', 'martial-arts']
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    facilities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility'
    }],
    coaches: [{
        name: String,
        qualification: String,
        experience: Number,
        photo: String,
        specialization: [String]
    }],
    schedule: [{
        day: String,
        timeSlots: [{
            start: String,
            end: String,
            level: String
        }]
    }],
    achievements: [{
        title: String,
        date: Date,
        description: String,
        participants: [String],
        level: String,
        position: String,
        images: [String]
    }],
    images: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Sports', sportsSchema);