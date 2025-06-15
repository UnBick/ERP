const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        unique: true,
        required: true
    },
    coverImage: String,
    category: {
        type: String,
        required: true
    },
    description: String,
    publisher: String,
    publishYear: Number,
    edition: String,
    quantity: {
        total: { type: Number, default: 1 },
        available: { type: Number, default: 1 }
    },
    location: {
        shelf: String,
        row: String,
        column: String
    },
    qrCode: String,
    status: {
        type: String,
        enum: ['available', 'issued', 'reserved', 'maintenance'],
        default: 'available'
    }
}, { timestamps: true });

const bookIssueSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
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
    renewals: {
        count: { type: Number, default: 0 },
        history: [{
            renewedDate: Date,
            previousDueDate: Date,
            newDueDate: Date
        }]
    },
    status: {
        type: String,
        enum: ['active', 'returned', 'overdue'],
        default: 'active'
    },
    fines: {
        amount: { type: Number, default: 0 },
        paid: { type: Boolean, default: false },
        paymentDate: Date
    }
});

const reservationSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    reservationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'fulfilled', 'cancelled'],
        default: 'pending'
    },
    notificationsSent: [{
        type: { type: String },
        date: Date,
        message: String
    }],
    validUntil: Date
});

const recommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    books: [{
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        score: Number,
        reason: String
    }],
    basedOn: {
        categories: [String],
        previousIssues: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }]
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
bookSchema.index({ title: 'text', author: 'text', isbn: 1 });
bookIssueSchema.index({ user: 1, status: 1 });
bookIssueSchema.index({ dueDate: 1 }, { expireAfterSeconds: 0 });
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

// Models
const Book = mongoose.model('Book', bookSchema);
const BookIssue = mongoose.model('BookIssue', bookIssueSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = {
    Book,
    BookIssue,
    Reservation,
    Recommendation
};