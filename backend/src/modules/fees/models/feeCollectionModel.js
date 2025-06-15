const mongoose = require('mongoose');

const feeCollectionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'cheque', 'online'],
        required: true
    },
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FeeCollection', feeCollectionSchema);