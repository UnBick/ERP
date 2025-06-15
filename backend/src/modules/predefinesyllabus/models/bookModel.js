const mongoose = require('mongoose');

const readingProgressSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: Number,
    timeSpent: {
        type: Number,
        default: 0
    },
    lastRead: {
        type: Date,
        default: Date.now
    },
    completed: {
        type: Boolean,
        default: false
    },
    bookmarks: [{
        page: Number,
        note: String,
        timestamp: Date
    }],
    annotations: [{
        page: Number,
        text: String,
        position: {
            x: Number,
            y: Number
        },
        timestamp: Date
    }]
});

const bookSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publisher: String,
    edition: String,
    isbn: {
        type: String,
        unique: true
    },
    description: String,
    category: {
        type: String,
        required: true
    },
    readingLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    coverImage: String,
    pdfUrl: String,
    fileType: {
        type: String,
        enum: ['pdf', 'epub'],
        required: true
    },
    totalPages: Number,
    price: Number,
    rating: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    readingProgress: [readingProgressSchema],
    isRequired: {
        type: Boolean,
        default: true
    },
    collections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookCollection'
    }],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);