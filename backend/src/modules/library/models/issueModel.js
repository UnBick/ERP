const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel',
        required: true
    },
    userModel: {
        type: String,
        required: true,
        enum: ['Staff', 'Teacher', 'Student']
    },
    issueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: Date,
    status: {
        type: String,
        enum: ['issued', 'returned', 'overdue'],
        default: 'issued'
    },
    fine: {
        amount: Number,
        paid: {
            type: Boolean,
            default: false
        },
        paidDate: Date
    }
}, {
    timestamps: true
});

// Check if the model exists before creating it
module.exports = mongoose.models.BookIssue || mongoose.model('BookIssue', bookIssueSchema);
