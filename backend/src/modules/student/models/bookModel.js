const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        unique: true,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publisher: String,
    edition: String,
    category: {
        type: String,
        required: true
    },
    subject: String,
    language: String,
    pages: Number,
    price: Number,
    quantity: {
        total: Number,
        available: Number
    },
    location: {
        shelf: String,
        row: String,
        column: String
    },
    coverImage: String,
    description: String,
    status: {
        type: String,
        enum: ['available', 'unavailable', 'maintenance'],
        default: 'available'
    }
}, { timestamps: true });

bookSchema.index({ isbn: 1 });
bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ category: 1, subject: 1 });
module.exports = mongoose.model('Book', bookSchema);