const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Teacher = require('../models/teacherModel');
const Student = require('../../student/models/studentModel');
const Attendance = require('../../academic/models/attendanceModel');
const Grade = require('../models/gradeModel');
const Report = require('../../student/models/reportModel');
const { generatePDF } = require('../../../utils/reportGenerator');

// Get all reports
exports.getAllReports = catchAsync(async (req, res) => {
    const teacher = await Teacher.findOne({ user: req.user._id });
    const reports = await Report.find({
        generatedBy: teacher._id
    })
    .sort('-createdAt')
    .populate('class section subject');

    res.json(ApiResponse.success('Reports retrieved successfully', reports));
});

// Generate report
exports.generateReport = catchAsync(async (req, res) => {
    const { type, dateRange, filters } = req.body;
    const teacher = await Teacher.findOne({ user: req.user._id });

    // Validate access permissions
    const hasAccess = await validateTeacherAccess(teacher, filters);
    if (!hasAccess) {
        return res.status(403).json(ApiResponse.error('Not authorized to generate this report'));
    }

    let reportData;
    switch (type) {
        case 'academic':
            reportData = await generateAcademicReport(teacher, dateRange, filters);
            break;
        case 'attendance':
            reportData = await generateAttendanceReport(teacher, dateRange, filters);
            break;
        case 'behavior':
            reportData = await generateBehavioralReport(teacher, dateRange, filters);
            break;
        default:
            return res.status(400).json(ApiResponse.error('Invalid report type'));
    }

    const report = await Report.create({
        type,
        dateRange,
        filters,
        data: reportData,
        generatedBy: teacher._id,
        class: filters.class,
        section: filters.section,
        subject: filters.subject
    });

    // Generate PDF if requested
    if (filters.format === 'pdf') {
        const pdfUrl = await generatePDF(reportData, type);
        report.fileUrl = pdfUrl;
        await report.save();
    }

    res.status(201).json(ApiResponse.success('Report generated successfully', report));
});

// Generate complete report card
exports.generateCompleteReportCard = catchAsync(async (req, res) => {
    const { classId, sectionId, studentId } = req.params;
    const teacher = await Teacher.findOne({ user: req.user._id });

    // Verify class teacher status
    const isClassTeacher = teacher.classTeacherFor?.some(
        assignment => assignment.class.toString() === classId &&
                     assignment.section.toString() === sectionId
    );

    if (!isClassTeacher) {
        return res.status(403).json(ApiResponse.error('Only class teachers can generate complete report cards'));
    }

    const reportCard = await generateCompleteReport(studentId, classId, sectionId);
    res.json(ApiResponse.success('Report card generated successfully', reportCard));
});

// Helper Functions
const validateTeacherAccess = async (teacher, filters) => {
    const { class: classId, section: sectionId, subject } = filters;

    // Class teachers can access all subjects for their class
    if (teacher.classTeacherFor?.some(
        assignment => assignment.class.toString() === classId &&
                     assignment.section.toString() === sectionId
    )) {
        return true;
    }

    // Subject teachers can only access their subjects
    return teacher.subjectTeacherFor.some(
        assignment => assignment.class.toString() === classId &&
                     assignment.section.toString() === sectionId &&
                     assignment.subject.toString() === subject
    );
};

const generateAcademicReport = async (teacher, dateRange, filters) => {
    const grades = await Grade.find({
        class: filters.class,
        section: filters.section,
        subject: filters.subject,
        examDate: {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end)
        }
    }).populate('student');

    return {
        grades,
        summary: calculateAcademicSummary(grades)
    };
};

const generateAttendanceReport = async (teacher, dateRange, filters) => {
    const attendance = await Attendance.find({
        class: filters.class,
        section: filters.section,
        date: {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end)
        }
    }).populate('student');

    return {
        attendance,
        summary: calculateAttendanceSummary(attendance)
    };
};

const generateBehavioralReport = async (teacher, dateRange, filters) => {
    // Implement behavioral report generation logic
    return {
        behavioralRecords: [],
        summary: {}
    };
};

const calculateAcademicSummary = (grades) => {
    return {
        averageScore: grades.reduce((acc, g) => acc + g.marks, 0) / grades.length,
        highestScore: Math.max(...grades.map(g => g.marks)),
        lowestScore: Math.min(...grades.map(g => g.marks)),
        passRate: (grades.filter(g => g.marks >= g.passMarks).length / grades.length) * 100
    };
};

const calculateAttendanceSummary = (attendance) => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    
    return {
        totalDays: total,
        presentDays: present,
        absentDays: total - present,
        attendanceRate: (present / total) * 100
    };
};

module.exports = exports;