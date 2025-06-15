const mongoose = require('mongoose');

const teachingAssignmentSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
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

    // Salary related fields - matching seeder requirements
    salary: {
        basicPay: {
            type: Number,
            required: true,
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
    assignedClasses: [{
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        section: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        }
    }],
    subjectTeacherFor: [teachingAssignmentSchema],
    
    // System fields
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true,
    collection: 'teachers'
});

// Indexes
teacherSchema.index({ staffID: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ isActive: 1 });
teacherSchema.index({ classTeacherFor: 1 });
teacherSchema.index({ 'salary.netPay': 1 });
teacherSchema.index({ user: 1 });
teacherSchema.index({ 'teachingAssignments.class': 1 });
teacherSchema.index({ 'teachingAssignments.section': 1 });

// Virtual fields
teacherSchema.virtual('fullName').get(function() {
    return this.name;
});

teacherSchema.virtual('allStudents').get(function() {
    let students = new Set();
    
    // Add students from class teacher role
    if (this.classTeacherFor?.students) {
        this.classTeacherFor.students.forEach(student => students.add(student._id.toString()));
    }
    
    // Add students from teaching assignments
    this.teachingAssignments?.forEach(assignment => {
        assignment.class?.students?.forEach(student => students.add(student._id.toString()));
        assignment.section?.students?.forEach(student => students.add(student._id.toString()));
    });
    
    return Array.from(students);
});

// Methods
teacherSchema.methods.calculateSalary = function() {
    const allowances = Object.values(this.salary.allowances).reduce((a, b) => a + b, 0);
    const deductions = Object.values(this.salary.deductions).reduce((a, b) => a + b, 0);
    
    this.salary.totalAllowances = allowances;
    this.salary.totalDeductions = deductions;
    this.salary.netPay = this.salary.basicPay + allowances - deductions;
    
    return this.salary.netPay;
};

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

teacherSchema.methods.getAssignedStudentIds = async function() {
    const classIds = [];
    const sectionIds = [];

    if (this.classTeacherFor) {
        classIds.push(this.classTeacherFor);
    }

    this.teachingAssignments.forEach(assignment => {
        if (assignment.class) classIds.push(assignment.class);
        if (assignment.section) sectionIds.push(assignment.section);
    });

    return { classIds, sectionIds };
};

teacherSchema.method('getAllStudents', async function() {
    let studentIds = new Set();
    
    // Get students from class teacher section
    if (this.classTeacherFor) {
        const classStudents = await mongoose.model('Student').find({
            'academicInfo.section': this.classTeacherFor,
            isActive: true
        }).select('_id');
        classStudents.forEach(student => studentIds.add(student._id.toString()));
    }

    // Get students from teaching assignments
    if (this.teachingAssignments && this.teachingAssignments.length > 0) {
        const classIds = this.teachingAssignments.map(a => a.class).filter(Boolean);
        const sectionIds = this.teachingAssignments.map(a => a.section).filter(Boolean);

        const students = await mongoose.model('Student').find({
            $or: [
                { 'academicInfo.class': { $in: classIds } },
                { 'academicInfo.section': { $in: sectionIds } }
            ],
            isActive: true
        }).select('_id');

        students.forEach(student => studentIds.add(student._id.toString()));
    }

    return Array.from(studentIds);
});

teacherSchema.methods.getStudentsForCommunication = async function() {
    try {
        if (!this.classTeacherFor) {
            console.log('No class teacher section found');
            return [];
        }

        const sectionId = this.classTeacherFor instanceof mongoose.Types.ObjectId 
            ? this.classTeacherFor 
            : this.classTeacherFor._id;

        console.log('Finding students for section:', sectionId);

        const Student = mongoose.model('Student');
        const students = await Student.find({
            'academicInfo.section': sectionId,
            isActive: true
        })
        .populate('user', 'name email')
        .select('personalInfo.firstName personalInfo.lastName academicInfo.rollNumber user')
        .lean();

        console.log(`Found ${students.length} students in section`);
        return students;
    } catch (error) {
        console.error('Error in getStudentsForCommunication:', error);
        return [];
    }
};

// Middleware
teacherSchema.pre('save', function(next) {
    // Calculate salary
    if (this.isModified('salary.basicPay') || 
        this.isModified('salary.allowances') || 
        this.isModified('salary.deductions')) {
        this.calculateSalary();
    }
    
    // Ensure roles array always includes 'Teacher'
    if (!this.roles.includes('Teacher')) {
        this.roles.push('Teacher');
    }
    next();
});

// Static methods for seeding
teacherSchema.statics.generateSalaryDefaults = function(basicPay) {
    const allowances = {
        hra: Math.floor(basicPay * 0.4),
        da: Math.floor(basicPay * 0.1),
        travelAllowance: 3000,
        medicalAllowance: 2000
    };
    const deductions = {
        pf: Math.floor(basicPay * 0.12),
        tds: Math.floor(basicPay * 0.1),
        professionalTax: 200
    };
    const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    
    return {
        basicPay,
        allowances,
        deductions,
        totalAllowances,
        totalDeductions,
        netPay: basicPay + totalAllowances - totalDeductions
    };
};

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;