const mongoose = require('mongoose');

const teachingAssignmentSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    }
});

const teacherSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { 
        type: String, 
        required: true 
    },
    staffID: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    contact: String,
    mobileNo: String,
    department: String,
    designation: String,
    address: String,
    dateOfBirth: Date,
    gender: String,
    religion: String,
    category: String,
    qualifications: String,
    joiningDate: Date,
    nationality: String,

    // Salary structure - keeping both old and new for compatibility
    salary: {
        type: Number,
        default: 0
    },
    salaryDetails: {
        basicPay: {
            type: Number,
            default: 0
        },
        allowances: {
            hra: { type: Number, default: 0 },
            da: { type: Number, default: 0 },
            travelAllowance: { type: Number, default: 3000 },
            medicalAllowance: { type: Number, default: 2000 }
        },
        deductions: {
            pf: { type: Number, default: 0 },
            tds: { type: Number, default: 0 },
            professionalTax: { type: Number, default: 200 }
        },
        totalAllowances: { type: Number, default: 0 },
        totalDeductions: { type: Number, default: 0 },
        netPay: { type: Number, default: 0 }
    },
    
    // Teaching related fields
    roles: {
        type: [String],
        default: ['Teacher']
    },
    isClassTeacher: {
        type: Boolean,
        default: false
    },
    classTeacherFor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        default: null
    },
    primaryClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    primarySection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    teachingAssignments: [teachingAssignmentSchema],
    
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true,
    collection: 'teachers'
});

// Indexes
teacherSchema.index({ classTeacherFor: 1 });
teacherSchema.index({ staffID: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ isActive: 1 });
teacherSchema.index({ department: 1 });

// Virtual fields
teacherSchema.virtual('fullName').get(function() {
    return this.name;
});

// Methods
teacherSchema.methods.getCurrentAssignments = function() {
    return this.teachingAssignments;
};

teacherSchema.methods.teachesSubject = function(subjectId) {
    return this.teachingAssignments.some(assignment => 
        assignment.subject.equals(subjectId)
    );
};

teacherSchema.methods.teachesClass = function(classId) {
    return this.teachingAssignments.some(assignment => 
        assignment.class.equals(classId)
    );
};

teacherSchema.methods.calculateSalary = function() {
    if (this.salaryDetails && this.salaryDetails.basicPay) {
        const allowances = Object.values(this.salaryDetails.allowances).reduce((a, b) => a + b, 0);
        const deductions = Object.values(this.salaryDetails.deductions).reduce((a, b) => a + b, 0);
        
        this.salaryDetails.totalAllowances = allowances;
        this.salaryDetails.totalDeductions = deductions;
        this.salaryDetails.netPay = this.salaryDetails.basicPay + allowances - deductions;
        this.salary = this.salaryDetails.netPay; // Keep old salary field updated
        
        return this.salaryDetails.netPay;
    }
    return this.salary; // Return old salary if new structure isn't used
};

// Pre-save middleware
teacherSchema.pre('save', function(next) {
    // Ensure roles array always includes 'Teacher'
    if (!this.roles.includes('Teacher')) {
        this.roles.push('Teacher');
    }

    // Calculate salary if needed
    if (this.salaryDetails && this.salaryDetails.basicPay) {
        this.calculateSalary();
    }

    next();
});

// Create and export model
const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema, 'Staff', staffSchema);

module.exports = Teacher;