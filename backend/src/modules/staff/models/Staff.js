const mongoose = require('mongoose');

const teachingAssignmentSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }
});

const staffSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    staffID: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    contact: String,
    department: String,
    designation: String,
    // Teaching assignments
    classAssignment: {  // Renamed from 'class' to avoid conflicts
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    sectionAssignment: {  // Renamed from 'section' to avoid conflicts
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    subjectAssignment: {  // Renamed from 'subject' to avoid conflicts
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    teachingAssignments: [teachingAssignmentSchema],
    isClassTeacher: {
        type: Boolean,
        default: false
    },
    classTeacherFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    roles: {
        type: [String],
        default: ['Teacher']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    strictPopulate: false // Add this to allow flexible population
});

const Staff = mongoose.model('Staff', staffSchema);
module.exports = Staff;