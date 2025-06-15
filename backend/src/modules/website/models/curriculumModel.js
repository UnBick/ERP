const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema({
    section: {
        type: String,
        enum: ['primary', 'middle', 'secondary', 'senior-secondary'],
        required: true
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    streamSubjects: [{
        stream: {
            type: String,
            enum: ['science', 'commerce', 'arts']
        },
        subjects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }]
    }],
    features: [{
        title: String,
        description: String,
        icon: String
    }],
    methodology: [{
        title: String,
        description: String,
        image: String
    }],
    assessmentPattern: {
        examTypes: [{
            name: String,
            weightage: Number
        }],
        gradingSystem: {
            grades: [{
                name: String,
                minMarks: Number,
                maxMarks: Number
            }]
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Curriculum', curriculumSchema);