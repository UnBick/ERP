const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const AcademicProgress = require('../models/studentProgressModel');
const StudentAttendance = require('../../student/models/attendanceModel');
const Student = require('../../student/models/studentModel');
const Exam = require('../../exams/models/examModel');
const Parent = require('../../parent/models/parentModel');
const mongoose = require('mongoose');

exports.getStudentProgress = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const { period = 'current' } = req.query;

    // Verify parent has access to this student
    const parent = await Parent.findOne({ 
        user: req.user._id,
        children: studentId 
    });

    if (!parent) {
        return res.status(403).json(
            ApiResponse.error('Not authorized to view this student\'s progress')
        );
    }

    const student = await Student.findById(studentId)
        .populate('academicInfo.class')
        .populate('academicInfo.section')
        .populate('academicInfo.subjects');

    if (!student) {
        return res.status(404).json(
            ApiResponse.error('Student not found')
        );
    }

    // Get date range based on period
    const dateRange = getPeriodDateRange(period);

    // Get attendance data with proper ObjectId construction
    const attendance = await StudentAttendance.aggregate([
        {
            $match: {
                student: new mongoose.Types.ObjectId(studentId),
                date: { $gte: dateRange.start, $lte: dateRange.end }
            }
        },
        {
            $group: {
                _id: null,
                totalDays: { $sum: 1 },
                presentDays: {
                    $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                }
            }
        }
    ]);

    // Get exam results
    const examResults = await Exam.find({
        'students.student': studentId,
        date: { $gte: dateRange.start, $lte: dateRange.end }
    })
    .populate('subject')
    .sort('-date')
    .lean();

    // Transform data for frontend
    const progressData = {
        student: {
            name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
            class: student.academicInfo.class.name,
            section: student.academicInfo.section.name,
            rollNumber: student.academicInfo.rollNumber
        },
        academic: {
            trendData: processExamTrend(examResults),
            subjectData: processSubjectPerformance(examResults),
            examResults: examResults.map(exam => ({
                id: exam._id,
                subject: exam.subject.name,
                date: exam.date,
                score: exam.students.find(s => s.student.toString() === studentId)?.marks || 0,
                totalMarks: exam.totalMarks,
                grade: calculateGrade(
                    exam.students.find(s => s.student.toString() === studentId)?.marks || 0,
                    exam.totalMarks
                ),
                status: exam.status
            }))
        },
        attendance: {
            data: {
                labels: ['Present', 'Absent'],
                datasets: [{
                    data: [
                        attendance[0]?.presentDays || 0,
                        (attendance[0]?.totalDays || 0) - (attendance[0]?.presentDays || 0)
                    ],
                    backgroundColor: ['#4CAF50', '#f44336']
                }]
            }
        },
        behavioral: {
            data: generateBehavioralData() // Mock data for now
        }
    };

    res.json(ApiResponse.success('Progress data retrieved successfully', progressData));
});

// Helper functions
const getPeriodDateRange = (period) => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
        case 'current':
            start.setMonth(start.getMonth() - 6);
            break;
        case 'yearly':
            start.setFullYear(start.getFullYear() - 1);
            break;
        case 'previous':
            start.setMonth(start.getMonth() - 12);
            now.setMonth(now.getMonth() - 6);
            break;
    }
    
    return { start, end: now };
};

const processExamTrend = (examResults) => {
    const monthlyAverages = {};
    examResults.forEach(exam => {
        const month = new Date(exam.date).toLocaleString('default', { month: 'short' });
        if (!monthlyAverages[month]) {
            monthlyAverages[month] = { total: 0, count: 0 };
        }
        monthlyAverages[month].total += (exam.students[0]?.marks / exam.totalMarks) * 100;
        monthlyAverages[month].count += 1;
    });

    return {
        labels: Object.keys(monthlyAverages),
        datasets: [{
            label: 'Average Score',
            data: Object.values(monthlyAverages).map(v => (v.total / v.count).toFixed(2)),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };
};

const processSubjectPerformance = (examResults) => {
    const subjectPerformance = {};
    
    examResults.forEach(exam => {
        const subjectName = exam.subject.name;
        if (!subjectPerformance[subjectName]) {
            subjectPerformance[subjectName] = { total: 0, count: 0 };
        }
        subjectPerformance[subjectName].total += (exam.students[0]?.marks / exam.totalMarks) * 100;
        subjectPerformance[subjectName].count += 1;
    });

    return {
        labels: Object.keys(subjectPerformance),
        datasets: [{
            label: 'Subject Performance',
            data: Object.values(subjectPerformance).map(v => (v.total / v.count).toFixed(2)),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            pointBackgroundColor: 'rgb(75, 192, 192)',
        }]
    };
};

const calculateGrade = (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
};

const generateBehavioralData = () => {
    // Mock behavioral data - replace with actual behavioral metrics
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
        labels: months,
        datasets: [{
            label: 'Behavior Score',
            data: months.map(() => Math.floor(Math.random() * 20) + 80), // Random scores between 80-100
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };
};

module.exports = exports;