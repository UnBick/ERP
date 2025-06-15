const mongoose = require('mongoose');

const artActivitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    grade: {
        type: String,
        required: true
    },
    images: [String],
    category: {
        type: String,
        enum: ['visual-arts', 'performing-arts', 'crafts', 'integrated-learning'],
        required: true
    },
    materials: [String],
    duration: String,
    learningOutcomes: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }
}, { timestamps: true });

module.exports = mongoose.model('ArtActivity', artActivitySchema);