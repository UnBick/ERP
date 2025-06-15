const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        required: true
    },
    period: {
        type: Number,
        required: true
    },
    time: {
        start: { type: String, required: true },
        end: { type: String, required: true }
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Indexes
timetableSchema.index({ class: 1, section: 1, day: 1, period: 1 });
timetableSchema.index({ teacher: 1, day: 1 });

// Export the model: check if already compiled before creating a new one.
module.exports = mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);
