const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    fee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fee',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    method: {
        type: String,
        enum: ['online', 'cash', 'cheque'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending'
    },
    receipt: String,
    transactionDetails: Object,
    remarks: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
