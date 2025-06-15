const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Report = require('../models/reportModel');
const Student = require('../models/studentModel');
const Template = require('../models/templateModel');
const Grade = require('../models/gradeModel');
const { generatePDF } = require('../../../utils/pdfGenerator');
const ExcelJS = require('exceljs');
const { sendNotification } = require('../../../utils/notificationUtils');

exports.getReports = catchAsync(async (req, res) => {
    const { type, period, page = 1, limit = 10 } = req.query;
    
    let dateFilter = {};
    switch (period) {
        case 'current':
            dateFilter = { semester: getCurrentSemester() };
            break;
        case 'previous':
            dateFilter = { semester: getPreviousSemester() };
            break;
        case 'yearly':
            dateFilter = { 
                generatedDate: {
                    $gte: new Date(new Date().getFullYear(), 0, 1)
                }
            };
            break;
        case 'custom':
            if (req.query.startDate && req.query.endDate) {
                dateFilter = {
                    generatedDate: {
                        $gte: new Date(req.query.startDate),
                        $lte: new Date(req.query.endDate)
                    }
                };
            }
            break;
    }

    const query = {
        type,
        ...dateFilter,
        status: { $ne: 'deleted' }
    };

    const [reports, total] = await Promise.all([
        Report.find(query)
            .sort({ generatedDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('generatedBy', 'name'),
        Report.countDocuments(query)
    ]);

    res.json(ApiResponse.success('Reports retrieved successfully', {
        reports,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    }));
});

exports.generateReportCards = catchAsync(async (req, res) => {
    const {
        scope,
        classId,
        sectionId,
        studentId,
        templateId,
        examType,
        includeSignature,
        includeLogo
    } = req.body;

    // Get template
    const template = await Template.findById(templateId);
    if (!template) {
        return res.status(404).json(
            ApiResponse.error('Report card template not found')
        );
    }

    // Get students based on scope
    let students = [];
    switch (scope) {
        case 'individual':
            students = await Student.find({ _id: studentId });
            break;
        case 'section':
            students = await Student.find({ 
                class: classId, 
                section: sectionId,
                status: 'active'
            });
            break;
        case 'class':
            students = await Student.find({ 
                class: classId,
                status: 'active'
            });
            break;
        case 'school':
            students = await Student.find({ status: 'active' });
            break;
    }

    // Generate report cards
    const reportCards = await Promise.all(students.map(async (student) => {
        const grades = await Grade.find({
            student: student._id,
            examType: examType === 'all' ? { $exists: true } : examType
        }).populate('subject');

        return {
            student,
            grades,
            template,
            includeSignature,
            includeLogo
        };
    }));

    // Generate PDF
    const pdf = await generatePDF('reportCard', reportCards);

    // Save report record
    const report = await Report.create({
        type: 'REPORT_CARD',
        generatedBy: req.user._id,
        scope,
        class: classId,
        section: sectionId,
        template: templateId,
        generatedDate: new Date(),
        status: 'generated'
    });

    // Send notifications
    await Promise.all(students.map(student => 
        sendNotification({
            type: 'academic',
            recipient: student.email,
            subject: 'Report Card Generated',
            message: 'Your report card has been generated and is available for download'
        })
    ));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report_cards.pdf');
    res.send(pdf);
});

exports.downloadReport = catchAsync(async (req, res) => {
    const { reportId, format } = req.params;
    const report = await Report.findById(reportId)
        .populate('data')
        .populate('template');

    if (!report) {
        return res.status(404).json(
            ApiResponse.error('Report not found')
        );
    }

    if (format === 'pdf') {
        const pdf = await generatePDF(report.type, report.data, report.template);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${report.type.toLowerCase()}_${reportId}.pdf`);
        res.send(pdf);
    } else if (format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Add headers
        worksheet.columns = Object.keys(report.data[0]).map(key => ({
            header: key,
            key: key
        }));

        // Add data
        worksheet.addRows(report.data);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${report.type.toLowerCase()}_${reportId}.xlsx`);
        await workbook.xlsx.write(res);
    }
});

exports.shareReport = catchAsync(async (req, res) => {
    const { reportId } = req.params;
    const { sharedBy, shareDate } = req.body;

    const report = await Report.findByIdAndUpdate(
        reportId,
        {
            $push: {
                shareHistory: { sharedBy, shareDate }
            },
            lastShared: shareDate
        },
        { new: true }
    );

    if (!report) {
        return res.status(404).json(
            ApiResponse.error('Report not found')
        );
    }

    res.json(ApiResponse.success('Report shared successfully', report));
});

exports.approveGrades = catchAsync(async (req, res) => {
    const { reportId } = req.params;

    const report = await Report.findByIdAndUpdate(
        reportId,
        {
            status: 'approved',
            approvedBy: req.user._id,
            approvedAt: new Date()
        },
        { new: true }
    );

    if (!report) {
        return res.status(404).json(
            ApiResponse.error('Report not found')
        );
    }

    // Update associated grades
    await Grade.updateMany(
        { report: reportId },
        { 
            status: 'published',
            publishedBy: req.user._id,
            publishedAt: new Date()
        }
    );

    // Send notifications
    const students = await Student.find({ 
        _id: { $in: report.students } 
    });

    await Promise.all(students.map(student => 
        sendNotification({
            type: 'academic',
            recipient: student.email,
            subject: 'Grades Published',
            message: 'Your grades have been approved and published'
        })
    ));

    res.json(ApiResponse.success('Grades approved and published successfully'));
});

// Helper functions
const getCurrentSemester = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month < 6 ? `${year}-1` : `${year}-2`;
};

const getPreviousSemester = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month < 6 ? `${year-1}-2` : `${year}-1`;
};

module.exports = exports;