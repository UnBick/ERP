const mongoose = require('mongoose');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Student = require('../../student/models/studentModel');
const Teacher = require('../models/teacherModel');
const Grade = require('../models/gradeModel');
const ExamType = require('../models/examTypeModel');
const Class = require('../../academic/models/classModel');
const Section = require('../../academic/models/sectionModel');
const { validateGrades } = require('../validations/teacherValidation');

// Add these constants at the top
const AUTO_PUBLISH_EXAM_TYPES = ['UNIT_TEST'];

// Get exam types
exports.getExamTypes = catchAsync(async (req, res) => {
    const examTypes = await ExamType.find().select('name autoPublish maxMarks');
    res.json(ApiResponse.success('Exam types retrieved successfully', examTypes));
});

// Update getStudentsForGrading function
exports.getStudentsForGrading = catchAsync(async (req, res) => {
    const { classId, sectionId } = req.query;
    console.log('Fetching students for:', { classId, sectionId });

    try {
        // First check if any classes exist
        const allClasses = await Class.find().lean();
        console.log('All available classes:', allClasses.map(c => ({
            id: c._id,
            number: c.name?.replace('Class ', ''),
            name: c.name
        })));

        // Find class by name or number
        let classDoc = await Class.findOne({
            $or: [
                { number: classId },
                { name: `Class ${classId}` }
            ],
            isActive: true
        });

        console.log('Initial class lookup:', {
            searchValue: classId,
            found: !!classDoc,
            details: classDoc
        });

        if (!classDoc) {
            return res.status(404).json({
                success: false,
                message: 'Class not found',
                debug: { 
                    searchedNumber: classId,
                    availableClasses: allClasses.map(c => c.name)
                }
            });
        }

        // Find section with case-insensitive matching
        const section = await Section.findOne({
            class: classDoc._id,
            name: new RegExp(`^${sectionId}$`, 'i')
        });

        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'Section not found',
                debug: { 
                    classId: classDoc._id, 
                    className: classDoc.name,
                    sectionId 
                }
            });
        }

        // Find students
        const students = await Student.find({
            'academicInfo.class': classDoc._id,
            'academicInfo.section': section._id,
            'isActive': true
        })
        .select('personalInfo.firstName personalInfo.lastName academicInfo.rollNumber')
        .sort('academicInfo.rollNumber')
        .lean();

        console.log(`Found ${students.length} students for class ${classDoc.name} section ${section.name}`);

        const formattedStudents = students.map(student => ({
            id: student._id.toString(),
            name: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
            rollNumber: student.academicInfo?.rollNumber || 'N/A'
        }));

        return res.json({
            success: true,
            message: 'Students retrieved successfully',
            data: formattedStudents,
            meta: {
                class: classDoc.name,
                section: section.name,
                totalStudents: formattedStudents.length
            }
        });

    } catch (error) {
        console.error('Error in getStudentsForGrading:', {
            error: error.message,
            stack: error.stack,
            query: { classId, sectionId }
        });
        return res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
});

// Submit grades
exports.submitGrades = catchAsync(async (req, res) => {
    const {
        examType,
        examDate,
        subject,
        maxMarks,
        grades,
        autoPublish
    } = req.body;

    const teacher = await Teacher.findOne({ user: req.user._id });

    // Validate teacher's permission to grade
    const canGrade = await validateTeacherGradingPermission(teacher, subject, examType);
    if (!canGrade) {
        return res.status(403).json(ApiResponse.error('Not authorized to submit grades'));
    }

    // Validate grades
    const validationErrors = validateGrades(grades, maxMarks);
    if (validationErrors.length > 0) {
        return res.status(400).json(ApiResponse.error('Invalid grades', validationErrors));
    }

    // Create grade entries
    const gradeEntries = await Promise.all(
        Object.entries(grades).map(([studentId, mark]) =>
            Grade.create({
                student: studentId,
                subject,
                examType,
                examDate: new Date(examDate),
                marks: mark,
                maxMarks,
                gradedBy: teacher._id,
                status: autoPublish ? 'published' : 'pending',
                gradedAt: new Date()
            })
        )
    );

    res.status(201).json(ApiResponse.success(
        autoPublish ? 'Grades submitted and published' : 'Grades submitted for approval',
        gradeEntries
    ));
});

const getAvailableClasses = (role) => {
    const classes = new Set();
    
    // Handle class teacher role
    if (role.classTeacherFor) {
        // If classTeacherFor is a single object
        if (role.classTeacherFor._id) {
            classes.add(role.classTeacherFor._id.toString());
        }
    }

    // Handle subject teacher role
    if (role.subjectTeacherFor && Array.isArray(role.subjectTeacherFor)) {
        role.subjectTeacherFor.forEach(assignment => {
            if (assignment.class && assignment.class._id) {
                classes.add(assignment.class._id.toString());
            }
        });
    }

    return Array.from(classes);
};

// Get teacher's grading permissions
exports.getTeacherRole = catchAsync(async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ user: req.user._id })
            .populate('classTeacherFor')
            .populate({
                path: 'teachingAssignments',
                populate: [
                    { path: 'class', select: 'name number' },
                    { path: 'section', select: 'name' }
                ]
            })
            .lean();

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        const formattedRole = {
            isClassTeacher: Boolean(teacher.classTeacherFor),
            classTeacherFor: teacher.classTeacherFor,
            isSubjectTeacher: Boolean(teacher.teachingAssignments?.length),
            subjectTeacherFor: teacher.teachingAssignments?.map(assignment => ({
                subjectId: assignment.subject?.toString(),
                classId: assignment.class?._id?.toString(),
                autoPublish: AUTO_PUBLISH_EXAM_TYPES.includes(assignment.examType)
            })) || [],
            availableClasses: [{
                id: '1',
                name: 'Class 1',
                sections: [{
                    id: 'A',
                    name: 'Section A'
                }]
            }]
        };

        return res.json({
            success: true,
            message: 'Teacher role retrieved successfully',
            data: formattedRole
        });
    } catch (error) {
        console.error('Error in getTeacherRole:', error);
        return res.status(500).json({
            success: false,
            message: 'Error retrieving teacher role',
            error: error.message
        });
    }
});

// Upload grades from file
exports.uploadGrades = catchAsync(async (req, res) => {
    const { examType, subject, examDate, grades } = req.body;
    const teacher = await Teacher.findOne({ user: req.user._id });

    // Validate uploaded data
    const validationErrors = validateUploadedGrades(grades);
    if (validationErrors.length > 0) {
        return res.status(400).json(ApiResponse.error('Invalid grade data', validationErrors));
    }

    // Process and save grades
    const processedGrades = await processUploadedGrades(grades, {
        teacher,
        examType,
        subject,
        examDate
    });

    res.json(ApiResponse.success('Grades uploaded successfully', processedGrades));
});

// Add this new function
exports.getSections = catchAsync(async (req, res) => {
    const { classId } = req.params;
    const teacher = await Teacher.findOne({ user: req.user._id })
        .populate({
            path: 'teachingAssignments',
            match: { class: classId },
            populate: { path: 'section', select: 'name' }
        })
        .lean();

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher not found'
        });
    }

    // Get unique sections for this class
    const sections = new Set();
    teacher.teachingAssignments?.forEach(assignment => {
        if (assignment.section) {
            sections.add(assignment.section);
        }
    });

    return res.json({
        success: true,
        message: 'Sections retrieved successfully',
        data: Array.from(sections)
    });
});

// Helper Functions
const validateTeacherGradingPermission = async (teacher, subject, examType) => {
    const examConfig = await ExamType.findById(examType);
    
    // Auto-publish exams can be graded by both class and subject teachers
    if (examConfig.autoPublish) {
        return true;
    }

    // For other exams, check subject teacher assignment
    return teacher.subjectTeacherFor.some(
        assignment => assignment.subject.toString() === subject
    );
};

const validateUploadedGrades = (grades) => {
    const errors = [];
    grades.forEach((grade, index) => {
        if (!grade.studentId || !grade.marks) {
            errors.push({
                row: index + 1,
                message: 'Missing required fields'
            });
        }
        if (isNaN(grade.marks) || grade.marks < 0 || grade.marks > grade.maxMarks) {
            errors.push({
                row: index + 1,
                message: `Invalid marks: ${grade.marks}`
            });
        }
    });
    return errors;
};

const processUploadedGrades = async (grades, context) => {
    const { teacher, examType, subject, examDate } = context;
    
    return await Promise.all(
        grades.map(grade =>
            Grade.create({
                student: grade.studentId,
                subject,
                examType,
                examDate,
                marks: grade.marks,
                maxMarks: grade.maxMarks,
                comments: grade.comments,
                gradedBy: teacher._id,
                status: 'pending'
            })
        )
    );
};

module.exports = exports;