const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: Date,
    fine: {
        amount: Number,
        paid: {
            type: Boolean,
            default: false
        },
        paidDate: Date
    },
    renewals: [{
        renewDate: Date,
        newDueDate: Date,
        renewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    status: {
        type: String,
        enum: ['issued', 'returned', 'overdue', 'lost'],
        default: 'issued'
    },
    remarks: String
}, { timestamps: true });

bookIssueSchema.index({ student: 1, book: 1 });
bookIssueSchema.index({ dueDate: 1, status: 1 });
module.exports = mongoose.model('BookIssue', bookIssueSchema);