const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['manual', 'scheduled', 'auto'],
        default: 'manual'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    metadata: {
        collections: [{
            name: String,
            count: Number
        }],
        timestamp: Date,
        version: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.Backup || mongoose.model('Backup', backupSchema);