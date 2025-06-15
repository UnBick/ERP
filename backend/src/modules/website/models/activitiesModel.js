const mongoose = require('mongoose');

const activitiesSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['cultural', 'sports', 'academic', 'social', 'other'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    date: {
        type: Date,
        required: true
    },
    venue: String,
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    schedule: [{
        time: String,
        event: String,
        participants: [String]
    }],
    images: [String],
    results: [{
        position: String,
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        category: String
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    }
}, { timestamps: true });

module.exports = mongoose.model('Activities', activitiesSchema);