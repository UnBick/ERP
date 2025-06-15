const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
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
        enum: ['alert', 'info', 'warning', 'success'],
        default: 'info'
    },
    category: {
        type: String,
        enum: ['attendance', 'schedule', 'grades', 'system', 'other'],
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    action: {
        type: String,
        enum: ['view', 'approve', 'reject', 'none'],
        default: 'none'
    },
    link: String
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;