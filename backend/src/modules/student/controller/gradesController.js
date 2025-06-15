const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Grade = require('../models/gradeModel');
const Exam = require('../../exams/models/examModel');
const { generateGradeReport } = require('../../../utils/pdfGenerator');

exports.getGrades = catchAsync(async (req, res) => {
    const { examType, subject } = req.query;
    
    let filter = { student: req.user._id };
    
    if (examType) filter.examType = examType;
    if (subject) filter.subject = subject;

    const grades = await Grade.find(filter)
        .populate('subject', 'name code')
        .populate('exam', 'name type date')
        .sort({ 'exam.date': -1 });

    res.json(ApiResponse.success('Grades retrieved successfully', grades));
});

exports.getPublishedGrades = catchAsync(async (req, res) => {
    const publishedGrades = await Grade.find({
        student: req.user._id,
        isPublished: true
    })
    .populate('exam', 'name type date')
    .populate('subject', 'name code')
    .sort({ 'exam.date': -1 });

    const enhancedGrades = publishedGrades.map(grade => ({
        ...grade.toObject(),
        reportAvailable: true,
        examId: grade.exam._id
    }));

    res.json(ApiResponse.success('Published grades retrieved successfully', enhancedGrades));
});

exports.getGradeReport = catchAsync(async (req, res) => {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
        return res.status(404).json(ApiResponse.error('Exam not found'));
    }

    const grades = await Grade.find({
        student: req.user._id,
        exam: examId,
        isPublished: true
    })
    .populate('subject', 'name code')
    .populate('exam', 'name type date maxMarks');

    if (!grades.length) {
        return res.status(404).json(ApiResponse.error('No grades found for this exam'));
    }

    const reportBuffer = await generateGradeReport(grades, exam, req.user);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=grade-report-${examId}.pdf`);
    res.send(reportBuffer);
});

exports.getGradeStatistics = catchAsync(async (req, res) => {
    const { examType } = req.query;

    const filter = { 
        student: req.user._id,
        isPublished: true 
    };
    if (examType) filter.examType = examType;

    const grades = await Grade.find(filter)
        .populate('subject', 'name')
        .populate('exam', 'maxMarks');

    const statistics = {
        totalExams: new Set(grades.map(g => g.exam._id.toString())).size,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 100,
        subjectWisePerformance: {}
    };

    let totalScore = 0;
    let totalItems = 0;

    grades.forEach(grade => {
        const percentage = (grade.marks / grade.exam.maxMarks) * 100;
        totalScore += percentage;
        totalItems++;

        statistics.highestScore = Math.max(statistics.highestScore, percentage);
        statistics.lowestScore = Math.min(statistics.lowestScore, percentage);

        const subjectName = grade.subject.name;
        if (!statistics.subjectWisePerformance[subjectName]) {
            statistics.subjectWisePerformance[subjectName] = {
                total: 0,
                count: 0,
                average: 0
            };
        }

        statistics.subjectWisePerformance[subjectName].total += percentage;
        statistics.subjectWisePerformance[subjectName].count++;
    });

    statistics.averageScore = totalItems ? (totalScore / totalItems).toFixed(2) : 0;

    Object.keys(statistics.subjectWisePerformance).forEach(subject => {
        const perf = statistics.subjectWisePerformance[subject];
        perf.average = (perf.total / perf.count).toFixed(2);
    });

    res.json(ApiResponse.success('Grade statistics retrieved successfully', statistics));
});

module.exports = exports;