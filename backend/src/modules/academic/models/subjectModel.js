const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    level: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function(v) {
                return v === 'all' || (Array.isArray(v) && v.length > 0);
            },
            message: 'Level must be "all" or a non-empty array of levels'
        }
    },
    isElective: {
        type: Boolean,
        default: false
    },
    department: {
        type: String,
        required: true,
        enum: ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physical Education']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);