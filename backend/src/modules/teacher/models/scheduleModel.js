const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
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
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    room: String,
    repeats: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly'],
        default: 'weekly'
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'rescheduled'],
        default: 'active'
    }
}, { timestamps: true });

scheduleSchema.index({ teacher: 1, day: 1, startTime: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;