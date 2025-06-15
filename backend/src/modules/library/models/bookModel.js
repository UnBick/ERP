const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    isbn: {
        type: String,
        unique: true,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: String,
    coverImage: String,
    totalCopies: {
        type: Number,
        required: true,
        default: 1
    },
    availableCopies: {
        type: Number,
        required: true,
        default: 1
    },
    location: String,
    publisher: String,
    publishYear: Number,
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Check if the model exists before creating it
module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
