const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Examination = require('../models/examinationModel');
const Result = require('../models/resultModel');
const Student = require('../models/studentModel');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { sendNotification } = require('../../../utils/notificationUtils');

exports.getExaminations = catchAsync(async (req, res) => {
    const { type, classId, sectionId, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (classId) query.class = classId;
    if (sectionId) query.section = sectionId;

    const currentDate = new Date();
    if (type === 'upcoming') {
        query.date = { $gt: currentDate };
    } else if (type === 'past') {
        query.date = { $lt: currentDate };
    }

    const [exams, total] = await Promise.all([
        Examination.find(query)
            .populate('subject', 'name code')
            .populate('class', 'name')
            .sort({ date: type === 'upcoming' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Examination.countDocuments(query)
    ]);

    res.json(ApiResponse.success('Examinations retrieved successfully', {
        exams,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    }));
});

exports.scheduleExam = catchAsync(async (req, res) => {
    const {
        name,
        subject,
        class: classId,
        section,
        date,
        duration,
        totalMarks,
        instructions
    } = req.body;

    // Check for exam time conflicts
    const conflictingExam = await Examination.findOne({
        class: classId,
        section,
        date: {
            $gte: new Date(date),
            $lt: new Date(new Date(date).getTime() + duration * 60000)
        }
    });

    if (conflictingExam) {
        return res.status(400).json(
            ApiResponse.error('Time slot conflicts with another exam')
        );
    }

    const exam = await Examination.create({
        name,
        subject,
        class: classId,
        section,
        date,
        duration,
        totalMarks,
        instructions,
        createdBy: req.user._id
    });

    // Notify students
    const students = await Student.find({ class: classId, section })
        .select('email');

    await Promise.all(students.map(student => 
        sendNotification({
            type: 'examination',
            recipient: student.email,
            subject: 'New Examination Scheduled',
            message: `${name} has been scheduled for ${new Date(date).toLocaleDateString()}`
        })
    ));

    res.status(201).json(ApiResponse.success('Examination scheduled successfully', exam));
});

exports.uploadResults = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);

    const results = [];
    const errors = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            const studentId = row.getCell(1).value;
            const marks = parseFloat(row.getCell(2).value);
            const grade = row.getCell(3).value;

            if (!studentId || isNaN(marks)) {
                errors.push(`Row ${rowNumber}: Invalid data`);
                return;
            }

            results.push({
                student: studentId,
                examination: req.body.examId,
                marks,
                grade,
                remarks: row.getCell(4).value || '',
                uploadedBy: req.user._id,
                uploadedAt: new Date()
            });
        }
    });

    if (errors.length) {
        return res.status(400).json(
            ApiResponse.error('Validation errors in file', { errors })
        );
    }

    await Result.insertMany(results);

    res.json(ApiResponse.success('Results uploaded successfully', {
        totalProcessed: results.length
    }));
});

exports.generateGradeCards = catchAsync(async (req, res) => {
    const { examId, classId, sectionId } = req.query;

    const results = await Result.find({ examination: examId })
        .populate('student', 'name rollNo')
        .populate('examination')
        .sort('student.rollNo');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=grade-cards.pdf');
    doc.pipe(res);

    results.forEach(result => {
        doc.fontSize(16).text('Grade Card', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Name: ${result.student.name}`);
        doc.text(`Roll No: ${result.student.rollNo}`);
        doc.text(`Examination: ${result.examination.name}`);
        doc.text(`Marks: ${result.marks}/${result.examination.totalMarks}`);
        doc.text(`Grade: ${result.grade}`);
        if (result.remarks) doc.text(`Remarks: ${result.remarks}`);
        doc.addPage();
    });

    doc.end();
});

exports.exportResults = catchAsync(async (req, res) => {
    const { examId } = req.params;

    const results = await Result.find({ examination: examId })
        .populate('student', 'name rollNo')
        .sort('student.rollNo');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Results');

    worksheet.columns = [
        { header: 'Roll No', key: 'rollNo' },
        { header: 'Name', key: 'name' },
        { header: 'Marks', key: 'marks' },
        { header: 'Grade', key: 'grade' },
        { header: 'Remarks', key: 'remarks' }
    ];

    results.forEach(result => {
        worksheet.addRow({
            rollNo: result.student.rollNo,
            name: result.student.name,
            marks: result.marks,
            grade: result.grade,
            remarks: result.remarks
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=results-${examId}.xlsx`);
    await workbook.xlsx.write(res);
});

module.exports = exports;