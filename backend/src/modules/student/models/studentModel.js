const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    enrollmentNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    personalInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: { 
            type: String, 
            enum: ['Male', 'Female', 'Other'],
            required: true 
        },
        religion: {
            type: String,
            enum: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Others']
        },
        category: {
            type: String,
            enum: ['General', 'OBC', 'SC', 'ST', 'Others']
        },
        nationality: {
            type: String,
            default: 'Indian'
        },
        placeOfBirth: String,
        motherTongue: {
            type: String,
            enum: ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu']
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']
        },
        aadharNo: String,
        avatar: String
    },
    academicInfo: {
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class',
            required: true
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section',
            required: true
        },
        subjects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }],
        rollNumber: {
            type: String,
            required: true
        },
        admissionNumber: String,
        admissionDate: {
            type: Date,
            default: Date.now
        },
        previousSchool: String,
        academicYear: {
            type: String,
            default: '2024-2025'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'promoted', 'transferred', 'graduated'],
            default: 'active'
        }
    },
    contactInfo: {
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: String,
        address: String,
        guardianName: String,
        guardianContact: String,
        guardianRelation: String,
        alternateContact: String
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent',
        required: true
    },
    documents: [{
        type: { type: String },
        name: String,
        url: String,
        uploadedAt: Date
    }],
    medicalInfo: {
        allergies: [String],
        medications: [String],
        specialNeeds: String,
        medicalHistory: String
    },
    fees: {
        pendingAmount: { type: Number, default: 0 },
        lastPaymentDate: Date,
        feeCategory: String
    },
    attendance: {
        totalPresent: { type: Number, default: 0 },
        totalAbsent: { type: Number, default: 0 },
        attendancePercentage: { type: Number, default: 100 }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
studentSchema.index({ enrollmentNumber: 1 });
studentSchema.index({ user: 1 });
studentSchema.index({ 'academicInfo.rollNumber': 1 });
studentSchema.index({ 'academicInfo.class': 1 });
studentSchema.index({ 'academicInfo.section': 1 });
studentSchema.index({ parent: 1 });
studentSchema.index({ 'contactInfo.email': 1 });
studentSchema.index({ isActive: 1 });
studentSchema.index({ 
    'personalInfo.firstName': 'text', 
    'personalInfo.lastName': 'text',
    enrollmentNumber: 'text'
});

// Virtual fields
studentSchema.virtual('fullName').get(function() {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Methods
studentSchema.methods.updateAttendance = function(present, absent) {
    this.attendance.totalPresent = present;
    this.attendance.totalAbsent = absent;
    const total = present + absent;
    this.attendance.attendancePercentage = total ? (present / total) * 100 : 100;
};

// Pre save middleware
studentSchema.pre('save', function(next) {
    if (this.isModified('attendance.totalPresent') || this.isModified('attendance.totalAbsent')) {
        this.updateAttendance(
            this.attendance.totalPresent,
            this.attendance.totalAbsent
        );
    }
    next();
});

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
module.exports = Student;