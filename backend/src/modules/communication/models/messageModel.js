const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Basic Message Details
    subject: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['direct', 'portal', 'email', 'sms'],
        default: 'direct'
    },

    // Sender Information
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderType: {
        type: String,
        enum: ['student', 'parent', 'teacher', 'admin'],
        required: true
    },

    // Recipients Information
    recipients: [{
        _id: false, // Prevent Mongoose from adding _id to subdocuments
        id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['student', 'parent', 'teacher', 'admin'],
            required: true
        },
        read: { 
            type: Boolean, 
            default: false 
        },
        readAt: Date
    }],

    // Attachments
    attachments: [{
        name: String,
        path: String,
        url: String,
        size: Number,
        type: String
    }],

    // Message Properties
    starred: { 
        type: Boolean, 
        default: false 
    },
    archived: { 
        type: Boolean, 
        default: false 
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },

    // Metadata
    status: {
        type: String,
        enum: ['sent', 'delivered', 'failed'],
        default: 'sent'
    },

    // Add status for message delivery
    deliveryStatus: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },

    // Add support for rich text content
    contentType: {
        type: String,
        enum: ['text', 'html', 'markdown'],
        default: 'text'
    },

    // Add reactions support
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: String
    }],

    // Add threading support
    parentMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },

    // Add read receipts
    readReceipts: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: Date
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ 'sender.id': 1, 'recipients.id': 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ 'recipients.read': 1 });
messageSchema.index({ starred: 1 });
messageSchema.index({ archived: 1 });

// Virtual for thread messages
messageSchema.virtual('thread', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'replyTo'
});

// Pre-save middleware to update timestamps
messageSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Instance method to mark message as read
messageSchema.methods.markAsRead = async function(userId) {
    const recipient = this.recipients.find(r => r.id.toString() === userId.toString());
    if (recipient && !recipient.read) {
        recipient.read = true;
        recipient.readAt = new Date();
        await this.save();
    }
};

// Static method to find unread messages
messageSchema.statics.findUnreadMessages = function(userId) {
    return this.find({
        'recipients.id': userId,
        'recipients.read': false
    }).sort({ createdAt: -1 });
};

// Check if model exists before compiling
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);