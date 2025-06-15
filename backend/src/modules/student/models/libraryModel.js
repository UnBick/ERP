const mongoose = require('mongoose');

const librarySchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    books: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        issueDate: Date,
        dueDate: Date,
        returnDate: Date,
        renewCount: {
            type: Number,
            default: 0
        },
        fine: {
            amount: Number,
            paid: Boolean,
            paidDate: Date
        },
        status: {
            type: String,
            enum: ['issued', 'returned', 'overdue'],
            required: true
        }
    }],
    card: {
        number: String,
        validUntil: Date,
        status: {
            type: String,
            enum: ['active', 'blocked', 'expired'],
            default: 'active'
        }
    },
    fines: {
        total: {
            type: Number,
            default: 0
        },
        paid: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

librarySchema.index({ student: 1 });
librarySchema.index({ 'books.dueDate': 1 });
librarySchema.index({ 'card.number': 1 });

module.exports = mongoose.model('Library', librarySchema);