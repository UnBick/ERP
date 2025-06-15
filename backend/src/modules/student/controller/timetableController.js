const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Timetable = require('../models/timetableModel');
const NotificationPreference = require('../models/notificationPreferenceModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

exports.getTimetable = catchAsync(async (req, res) => {
    const timetable = await Timetable.find({
        class: req.user.class,
        section: req.user.section,
        academicYear: req.user.academicYear
    })
    .populate('subject', 'name code')
    .populate('teacher', 'name')
    .populate('room', 'name number');

    res.json(ApiResponse.success('Timetable retrieved successfully', timetable));
});

exports.exportTimetable = catchAsync(async (req, res) => {
    const { format } = req.query;
    const timetable = await Timetable.find({
        class: req.user.class,
        section: req.user.section
    })
    .populate('subject', 'name')
    .populate('room', 'name');

    if (format === 'pdf') {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=timetable.pdf');
        doc.pipe(res);

        // PDF Generation Logic
        doc.fontSize(16).text('Class Timetable', { align: 'center' });
        doc.moveDown();

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        days.forEach(day => {
            doc.fontSize(14).text(day);
            const dayClasses = timetable.filter(t => t.day === day);
            dayClasses.forEach(c => {
                doc.fontSize(12).text(
                    `${c.time}: ${c.subject.name} (${c.room.name})`
                );
            });
            doc.moveDown();
        });

        doc.end();

    } else if (format === 'excel') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Timetable');

        // Excel Generation Logic
        worksheet.columns = [
            { header: 'Day', key: 'day' },
            { header: 'Time', key: 'time' },
            { header: 'Subject', key: 'subject' },
            { header: 'Room', key: 'room' }
        ];

        timetable.forEach(item => {
            worksheet.addRow({
                day: item.day,
                time: item.time,
                subject: item.subject.name,
                room: item.room.name
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=timetable.xlsx');
        await workbook.xlsx.write(res);
    }
});

exports.updateNotificationPreferences = catchAsync(async (req, res) => {
    const { enabled } = req.body;

    await NotificationPreference.findOneAndUpdate(
        { student: req.user._id, type: 'timetable' },
        {
            enabled,
            updatedAt: new Date(),
            settings: {
                reminderTime: 15, // default 15 minutes before
                notificationMethod: ['push', 'email']
            }
        },
        { upsert: true, new: true }
    );

    res.json(ApiResponse.success('Notification preferences updated successfully'));
});

exports.getNotificationPreferences = catchAsync(async (req, res) => {
    const preferences = await NotificationPreference.findOne({
        student: req.user._id,
        type: 'timetable'
    });

    res.json(ApiResponse.success('Notification preferences retrieved', preferences));
});