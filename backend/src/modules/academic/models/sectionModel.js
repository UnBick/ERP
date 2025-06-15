const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',  // Changed from 'Teacher' to 'Staff' to match your model
        default: null
    },
    capacity: {
        type: Number,
        required: true,
        default: 30,
        min: 1
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    subjectTeachers: [{
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: true
        }
    }],
    academicYear: {
        type: String,
        required: true,
        default: '2024-2025'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
sectionSchema.virtual('className').get(function() {
    return this.class ? this.class.name : 'N/A';
});

sectionSchema.virtual('currentStrength').get(function() {
    return this.students ? this.students.length : 0;
});

// Indexes for performance
sectionSchema.index({ class: 1, name: 1, academicYear: 1 }, { unique: true });
sectionSchema.index({ classTeacher: 1 });
sectionSchema.index({ isActive: 1 });
sectionSchema.index({ 'subjectTeachers.teacher': 1 });
sectionSchema.index({ 'subjectTeachers.subject': 1 });

// Methods
sectionSchema.methods.getSubjectTeacher = function(subjectId) {
    const assignment = this.subjectTeachers.find(st => 
        st.subject.toString() === subjectId.toString()
    );
    return assignment ? assignment.teacher : null;
};

sectionSchema.methods.hasVacancy = function() {
    return this.students.length < this.capacity;
};

// Middleware
sectionSchema.pre('save', function(next) {
    // Ensure students array doesn't exceed capacity
    if (this.students && this.students.length > this.capacity) {
        next(new Error('Section capacity exceeded'));
    }
    next();
});

// Static methods
sectionSchema.statics.findByTeacher = function(teacherId) {
    return this.find({
        $or: [
            { classTeacher: teacherId },
            { 'subjectTeachers.teacher': teacherId }
        ]
    });
};

module.exports = mongoose.model('Section', sectionSchema);