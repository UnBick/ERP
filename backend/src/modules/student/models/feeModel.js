const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    feeStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FeeStructure',
        required: true
    },
    transactions: [{
        amount: Number,
        date: Date,
        mode: {
            type: String,
            enum: ['cash', 'online', 'cheque']
        },
        reference: String,
        status: {
            type: String,
            enum: ['pending', 'success', 'failed']
        },
        receipt: String
    }],
    installments: [{
        term: String,
        dueDate: Date,
        amount: Number,
        paid: Boolean,
        paidDate: Date,
        lateFeePaid: Number
    }],
    concession: {
        type: {
            type: String,
            enum: ['percentage', 'amount']
        },
        value: Number,
        reason: String,
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    totalAmount: Number,
    paidAmount: Number,
    pendingAmount: Number,
    lastPaymentDate: Date,
    nextDueDate: Date,
    status: {
        type: String,
        enum: ['paid', 'partial', 'pending', 'overdue'],
        required: true
    }
}, { timestamps: true });

// Indexes
feeSchema.index({ student: 1, academicYear: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ nextDueDate: 1 });

// Export the model only if it doesn't exist already
module.exports = mongoose.models.Fee || mongoose.model('Fee', feeSchema);
