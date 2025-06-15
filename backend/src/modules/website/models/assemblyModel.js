const mongoose = require('mongoose');

const assemblySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    theme: String,
    schedule: [{
        activity: String,
        duration: String,
        participants: [String]
    }],
    incharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    specialMentions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        achievement: String
    }],
    photographs: [String],
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    remarks: String
}, { timestamps: true });

module.exports = mongoose.model('Assembly', assemblySchema);