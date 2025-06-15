const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    category: {
        type: String,
        enum: ['academic', 'cultural', 'sports', 'social', 'technical'],
        required: true
    },
    incharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    members: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        role: {
            type: String,
            enum: ['president', 'vice-president', 'secretary', 'member'],
            default: 'member'
        },
        joinDate: Date
    }],
    activities: [{
        title: String,
        description: String,
        date: Date,
        images: [String],
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }]
    }],
    meetings: [{
        date: Date,
        agenda: String,
        minutes: String,
        attendees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }]
    }],
    image: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);