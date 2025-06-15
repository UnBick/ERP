const mongoose = require('mongoose');

const interHouseSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        enum: ['sports', 'cultural', 'academic', 'other'],
        required: true
    },
    participants: [{
        house: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'House'
        },
        members: [{
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            role: String
        }],
        position: Number,
        points: Number
    }],
    venue: String,
    rules: [String],
    judges: [{
        name: String,
        designation: String
    }],
    results: {
        winner: {
            house: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'House'
            },
            points: Number
        },
        runnerUp: {
            house: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'House'
            },
            points: Number
        }
    },
    images: [String],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    }
}, { timestamps: true });

module.exports = mongoose.model('InterHouse', interHouseSchema);