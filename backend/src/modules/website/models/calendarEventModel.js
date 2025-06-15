const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['academic', 'holiday', 'exam', 'event', 'other'],
        default: 'academic'
    },
    description: String,
    color: String,
    isAllDay: {
        type: Boolean,
        default: false
    },
    recurrence: {
        frequency: String,
        interval: Number,
        endDate: Date
    },
    location: String,
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);