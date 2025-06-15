const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Class name is required']
    },
    level: {
        type: String,
        enum: ['Middle School', 'High School'],
        required: [true, 'Level is required']
    },
    section: {
        type: String,
        required: [true, 'Section is required']
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    // Force the collection name to match your existing data
    collection: 'classes'
});

// Add a virtual for the full class name (including section)
classSchema.virtual('fullName').get(function() {
    return `${this.name} - ${this.section}`;
});

module.exports = mongoose.models.Class || mongoose.model('Class', classSchema);
