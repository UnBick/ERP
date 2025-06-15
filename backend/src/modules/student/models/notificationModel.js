const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['academic', 'attendance', 'fee', 'exam', 'general'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    read: {
        type: Boolean,
        default: false
    },
    link: String,
    metadata: mongoose.Schema.Types.Mixed,
    expiresAt: Date
}, { timestamps: true });

// Indexes
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.index({ type: 1, priority: 1 });

// Use the existing model if it exists or create a new one if not
module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
