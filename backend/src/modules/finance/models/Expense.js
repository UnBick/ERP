const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['utilities', 'supplies', 'maintenance', 'salary', 'transport', 'other']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'bank_transfer', 'cheque'],
        required: true
    },
    receiptNumber: {
        type: String,
        unique: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    attachments: [{
        type: String // URL or file path
    }]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);