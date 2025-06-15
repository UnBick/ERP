const mongoose = require('mongoose');

const scheduleNoteSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    note: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['reminder', 'assignment', 'exam', 'other'],
        default: 'other'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, { timestamps: true });

const ScheduleNote = mongoose.model('ScheduleNote', scheduleNoteSchema);
module.exports = ScheduleNote;