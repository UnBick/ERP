const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Subject is required']
    },
    date: {
        type: Date,
        required: [true, 'Exam date is required']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Export only one model
module.exports = mongoose.model('Exam', examSchema);
