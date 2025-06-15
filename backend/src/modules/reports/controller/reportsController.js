const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const StudentReport = require('../models/studentReportModel');
const ExamReport = require('../models/examReportModel');
const AttendanceReport = require('../models/attendanceReportModel');
const FinanceReport = require('../models/financeReportModel');
const PayrollReport = require('../models/payrollReportModel');
const { generatePDF, generateExcel } = require('../../../utils/reportGenerator');
const Staff = require('../../staff/models/staffModel');
const StaffAttendance = require('../../staff/models/staffAttendanceModel');
const Class = require('../../academic/models/Class');
const Section = require('../../academic/models/sectionModel'); // Add this import
const Student = require('../../student/models/studentModel');
const AttendanceModel = require('../models/AttendanceModel'); // Add this import
const Subject = require('../../academic/models/subjectModel');
const ExamResult = require('../../exams/models/examResultModel');

const calculateAttendanceStats = (attendance, type = 'daily') => {
    if (type === 'daily') return attendance;

    const stats = attendance.reduce((acc, record) => {
        const key = type === 'monthly' ? 
            `${record.month}-${record.year}` : 
            record.year.toString();
        
        if (!acc[key]) {
            acc[key] = {
                total: 0,
                present: 0,
                absent: 0
            };
        }
        
        acc[key].total++;
        acc[key][record.status.toLowerCase()]++;
        return acc;
    }, {});

    return Object.entries(stats).map(([period, data]) => ({
        period,
        presentPercentage: ((data.present / data.total) * 100).toFixed(2),
        absentPercentage: ((data.absent / data.total) * 100).toFixed(2),
        totalDays: data.total
    }));
};

// Student Reports
exports.getStudentReports = catchAsync(async (req, res) => {
    const { classId, startDate, endDate } = req.query;
    
    try {
        // Validate inputs
        if (!classId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters',
                data: []
            });
        }

        const query = {
            'academicInfo.class': mongoose.Types.ObjectId(classId),
            isActive: true
        };

        const students = await Student.find(query)
            .select('personalInfo academicInfo')
            .populate('academicInfo.class', 'name')
            .sort({ 'personalInfo.firstName': 1 });

        const reports = students.map(student => ({
            id: student._id,
            studentName: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
            className: student.academicInfo?.class?.name || 'N/A',
            examName: 'Term 1', // You can modify this based on your needs
            marks: '-',
            grade: '-'
        }));

        return res.json({
            success: true,
            message: 'Student reports retrieved successfully',
            data: reports
        });

    } catch (error) {
        console.error('Error in getStudentReports:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student reports',
            error: error.message,
            data: []
        });
    }
});

// Exam Reports
exports.getExamReports = catchAsync(async (req, res) => {
    const { classId, sectionId, examType } = req.query;
    
    try {
        // Validate class and section
        const targetClass = await Class.findById(classId);
        if (!targetClass) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Get all subjects for this class
        const subjects = await Subject.find({
            class: classId
        });

        // Get student list
        const studentQuery = {
            'academicInfo.class': mongoose.Types.ObjectId(classId),
            isActive: true,
            ...(sectionId && { 'academicInfo.section': mongoose.Types.ObjectId(sectionId) })
        };

        const students = await Student.find(studentQuery)
            .select('personalInfo academicInfo')
            .populate('academicInfo.class', 'name')
            .populate('academicInfo.section', 'name')
            .sort({ 'academicInfo.rollNumber': 1 });

        // Get exam results for all students
        const examResults = await ExamResult.find({
            student: { $in: students.map(s => s._id) },
            examType: examType,
            class: classId
        }).populate('subject', 'name code');

        // Process each student's results
        const examReports = students.map(student => {
            // Get this student's results
            const studentResults = examResults.filter(result => 
                result.student.toString() === student._id.toString()
            );

            // If no results found, mark as not uploaded
            if (studentResults.length === 0) {
                return {
                    id: student._id,
                    studentName: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
                    rollNumber: student.academicInfo?.rollNumber || 'N/A',
                    className: student.academicInfo?.class?.name || targetClass.name,
                    sectionName: student.academicInfo?.section?.name || 'N/A',
                    examType,
                    overallPercentage: null,
                    overallGrade: null,
                    marksStatus: 'Not Uploaded',
                    subjectWiseMarks: []
                };
            }

            // Calculate subject-wise marks
            const subjectWiseMarks = subjects.map(subject => {
                const result = studentResults.find(r => 
                    r.subject._id.toString() === subject._id.toString()
                );

                if (!result) {
                    return {
                        subjectId: subject._id,
                        subjectName: subject.name,
                        marksObtained: 0,
                        totalMarks: 100,
                        percentage: '0.0',
                        grade: 'F',
                        status: 'Not Evaluated'
                    };
                }

                const percentage = ((result.marksObtained / result.totalMarks) * 100).toFixed(1);
                return {
                    subjectId: subject._id,
                    subjectName: subject.name,
                    marksObtained: result.marksObtained,
                    totalMarks: result.totalMarks,
                    percentage,
                    grade: calculateGrade(percentage),
                    status: 'Evaluated'
                };
            });

            // Calculate overall percentage
            const totalMarks = subjectWiseMarks.reduce((sum, subj) => sum + subj.marksObtained, 0);
            const totalPossible = subjectWiseMarks.reduce((sum, subj) => sum + subj.totalMarks, 0);
            const overallPercentage = ((totalMarks / totalPossible) * 100).toFixed(1);

            return {
                id: student._id,
                studentName: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
                rollNumber: student.academicInfo?.rollNumber || 'N/A',
                className: student.academicInfo?.class?.name || targetClass.name,
                sectionName: student.academicInfo?.section?.name || 'N/A',
                examType,
                overallPercentage,
                overallGrade: calculateGrade(overallPercentage),
                marksStatus: 'Evaluated',
                subjectWiseMarks
            };
        });

        return res.json({
            success: true,
            message: 'Exam reports retrieved successfully',
            data: examReports,
            meta: {
                totalStudents: students.length,
                marksUploaded: examReports.filter(r => r.marksStatus === 'Evaluated').length,
                pendingUploads: examReports.filter(r => r.marksStatus === 'Not Uploaded').length
            }
        });

    } catch (error) {
        console.error('[ExamReports] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch exam reports',
            error: error.message
        });
    }
});

const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
};

// Attendance Reports
exports.getAttendanceReports = catchAsync(async (req, res) => {
    const { classId, sectionId, reportType, date, month, year } = req.query;
    console.log('[ReportsController] Request params:', { classId, sectionId, reportType, date, month, year });

    try {
        // Validate class exists
        const targetClass = await Class.findById(classId);
        if (!targetClass) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Build student query
        const studentQuery = {
            'academicInfo.class': mongoose.Types.ObjectId(classId),
            isActive: true
        };

        // Add section filter if provided
        if (sectionId) {
            studentQuery['academicInfo.section'] = mongoose.Types.ObjectId(sectionId);
        }

        console.log('[ReportsController] Student query:', JSON.stringify(studentQuery, null, 2));

        // Get students with proper population
        const students = await Student.find(studentQuery)
            .select('personalInfo academicInfo')
            .sort({ 'academicInfo.rollNumber': 1 });

        console.log(`[ReportsController] Found ${students.length} students`);

        if (students.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No students found for the given criteria',
                data: [],
                meta: {
                    reportType,
                    class: targetClass.name,
                    totalStudents: 0
                }
            });
        }

        // For daily reports
        if (reportType === 'daily') {
            const dailyRecords = students.map(student => ({
                id: student._id,
                studentName: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
                rollNumber: student.academicInfo?.rollNumber || 'N/A',
                date: new Date(date).toISOString().split('T')[0],
                status: Math.random() > 0.2 ? 'present' : 'absent' // Temporary random status
            }));

            return res.json({
                success: true,
                message: 'Daily attendance report retrieved successfully',
                data: dailyRecords,
                meta: {
                    reportType,
                    date,
                    class: targetClass.name,
                    totalStudents: students.length
                }
            });
        }

        // For monthly/yearly reports
        const attendance = await Promise.all(
            students.map(async (student) => {
                // Generate random attendance stats for testing
                const totalDays = reportType === 'monthly' ? 30 : 365;
                const presentDays = Math.floor(Math.random() * totalDays * 0.8 + totalDays * 0.2);
                
                return {
                    studentId: student._id,
                    studentName: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
                    rollNumber: student.academicInfo?.rollNumber || 'N/A',
                    records: {
                        presentPercentage: ((presentDays / totalDays) * 100).toFixed(2),
                        absentPercentage: (((totalDays - presentDays) / totalDays) * 100).toFixed(2),
                        totalDays
                    }
                };
            })
        );

        return res.json({
            success: true,
            message: 'Attendance report retrieved successfully',
            data: attendance,
            meta: {
                reportType,
                class: targetClass.name,
                totalStudents: students.length,
                ...(sectionId && { section: 'Section info' })
            }
        });

    } catch (error) {
        console.error('[ReportsController] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve attendance reports',
            error: error.message
        });
    }
});

const generateAttendanceRecords = async (studentId, dateRange, reportType) => {
    try {
        console.log('[ReportsController] Generating attendance records:', { 
            studentId, 
            dateRange, 
            reportType 
        });

        // Find student first to ensure they exist
        const student = await Student.findById(studentId);
        if (!student) {
            console.error('[ReportsController] Student not found:', studentId);
            return [];
        }

        // Query for actual attendance records
        const query = {
            'academicInfo.student': studentId,
            date: {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            }
        };

        // Format records based on report type
        switch (reportType) {
            case 'daily':
                return formatDailyRecords(student, dateRange);
            case 'monthly':
                return formatMonthlyRecords(student, dateRange);
            case 'yearly':
                return formatYearlyRecords(student, dateRange);
            default:
                throw new Error('Invalid report type');
        }
    } catch (error) {
        console.error('[ReportsController] Error generating attendance records:', error);
        return [];
    }
};

const formatDailyRecords = async (student, dateRange) => {
    try {
        console.log('[ReportsController] Formatting daily records:', {
            studentId: student._id,
            dateRange
        });

        // Return a single record for the selected date
        return {
            date: dateRange.startDate.toISOString().split('T')[0],
            status: 'present', // You should get this from your actual attendance records
            rollNumber: student.academicInfo?.rollNumber || 'N/A',
            studentName: `${student.personalInfo?.firstName} ${student.personalInfo?.lastName}`,
            remarks: ''
        };
    } catch (error) {
        console.error('[ReportsController] Error in formatDailyRecords:', error);
        return null;
    }
};

const formatMonthlyRecords = async (student, dateRange) => {
    const records = await Student.aggregate([
        {
            $match: {
                _id: student._id,
                'academicInfo.attendanceRecords.date': {
                    $gte: dateRange.startDate,
                    $lte: dateRange.endDate
                }
            }
        },
        { $unwind: '$academicInfo.attendanceRecords' },
        {
            $group: {
                _id: {
                    month: { $month: '$academicInfo.attendanceRecords.date' },
                    year: { $year: '$academicInfo.attendanceRecords.date' }
                },
                total: { $sum: 1 },
                present: {
                    $sum: {
                        $cond: [
                            { $eq: ['$academicInfo.attendanceRecords.status', 'present'] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    // Return single record format instead of array
    const record = records[0] || {
        present: 0,
        total: 0
    };

    return {
        presentPercentage: ((record.present / (record.total || 1)) * 100).toFixed(2),
        absentPercentage: (((record.total - record.present) / (record.total || 1)) * 100).toFixed(2),
        totalDays: record.total || 0
    };
};

const formatYearlyRecords = async (student, dateRange) => {
    const records = await Student.aggregate([
        {
            $match: {
                _id: student._id,
                'academicInfo.attendanceRecords.date': {
                    $gte: dateRange.startDate,
                    $lte: dateRange.endDate
                }
            }
        },
        { $unwind: '$academicInfo.attendanceRecords' },
        {
            $group: {
                _id: { $year: '$academicInfo.attendanceRecords.date' },
                total: { $sum: 1 },
                present: {
                    $sum: {
                        $cond: [
                            { $eq: ['$academicInfo.attendanceRecords.status', 'present'] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    // Return single record format instead of array
    const record = records[0] || {
        present: 0,
        total: 0
    };

    return {
        presentPercentage: ((record.present / (record.total || 1)) * 100).toFixed(2),
        absentPercentage: (((record.total - record.present) / (record.total || 1)) * 100).toFixed(2),
        totalDays: record.total || 0
    };
};

// Finance Reports
exports.getFinanceReports = catchAsync(async (req, res) => {
    const { type, startDate, endDate } = req.query;
    
    try {
        if (!type || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters',
                data: [] // Return empty array instead of null
            });
        }

        const query = {
            type,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };

        const reports = await FinanceReport.find(query)
            .populate('category')
            .sort({ date: -1 });

        const formattedReports = reports.map(report => ({
            id: report._id.toString(), // Ensure ID is a string
            date: report.date.toISOString().split('T')[0],
            description: report.description || 'N/A',
            amount: report.amount || 0,
            category: report.category?.name || 'Uncategorized',
            type: report.type
        })) || []; // Fallback to empty array if map fails

        return res.json({
            success: true,
            message: 'Finance reports retrieved successfully',
            data: formattedReports
        });

    } catch (error) {
        console.error('Error in getFinanceReports:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch finance reports',
            error: error.message,
            data: [] // Always return an array
        });
    }
});

exports.exportFinanceReport = catchAsync(async (req, res) => {
    const { type, startDate, endDate } = req.query;
    
    try {
        // ... implement export logic ...
        const reports = await FinanceReport.find({
            type,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });

        // Generate CSV content
        const csvContent = generateFinanceReportCSV(reports);

        // Set response headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=finance_report_${type}_${startDate}.csv`);

        // Send CSV content
        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting finance report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export finance report',
            error: error.message
        });
    }
});

// Payroll Reports
exports.getPayrollReports = catchAsync(async (req, res) => {
    const { month, year } = req.query;
    console.log('Received payroll request:', { month, year });

    try {
        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required',
                data: []
            });
        }

        // Convert month name to number if string is provided
        const monthNum = typeof month === 'string' ? 
            months.indexOf(month.toLowerCase()) + 1 : 
            parseInt(month);

        const yearNum = parseInt(year);

        console.log('Querying with:', { month: monthNum, year: yearNum });

        const reports = await Payroll.find({
            month: monthNum,
            year: yearNum,
            isActive: true
        })
        .populate('staffId', 'name department')
        .lean()
        .exec();

        console.log(`Found ${reports.length} payroll records`);

        const formattedReports = reports.map(report => ({
            _id: report._id.toString(),
            staffId: report.staffId?._id?.toString() || 'N/A',
            staffName: report.staffName || 'N/A',
            basicPay: report.basicPay || 0,
            allowances: {
                hra: report.allowances?.hra || 0,
                da: report.allowances?.da || 0,
                travelAllowance: report.allowances?.travelAllowance || 0,
                medicalAllowance: report.allowances?.medicalAllowance || 0
            },
            deductions: {
                pf: report.deductions?.pf || 0,
                tds: report.deductions?.tds || 0,
                professionalTax: report.deductions?.professionalTax || 0
            },
            totalAllowances: report.totalAllowances || 0,
            totalDeductions: report.totalDeductions || 0,
            netPay: report.netPay || 0,
            status: report.status || 'pending',
            month: report.month,
            year: report.year
        }));

        return res.status(200).json({
            success: true,
            message: 'Payroll reports retrieved successfully',
            data: formattedReports
        });

    } catch (error) {
        console.error('Error in getPayrollReports:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch payroll reports',
            error: error.message,
            data: []
        });
    }
});

// Generate Reports
exports.generateReport = catchAsync(async (req, res) => {
    const { type, filters, format } = req.body;
    let report;

    switch (type) {
        case 'student':
            report = await generateStudentReport(filters, format, req.user._id);
            break;
        case 'exam':
            report = await generateExamReport(filters, format, req.user._id);
            break;
        case 'attendance':
            report = await generateAttendanceReport(filters, format, req.user._id);
            break;
        case 'finance':
            report = await generateFinanceReport(filters, format, req.user._id);
            break;
        case 'payroll':
            report = await generatePayrollReport(filters, format, req.user._id);
            break;
        default:
            return res.status(400).json(ApiResponse.error('Invalid report type'));
    }

    res.status(201).json(ApiResponse.success('Report generated successfully', report));
});

// Download Report
exports.downloadReport = catchAsync(async (req, res) => {
    const { id, type } = req.params;
    const ReportModel = getReportModel(type);
    
    const report = await ReportModel.findById(id);
    if (!report?.fileUrl) {
        return res.status(404).json(ApiResponse.error('Report file not found'));
    }

    res.download(report.fileUrl);
});

// Helper Functions
const getReportModel = (type) => {
    switch (type) {
        case 'student': return StudentReport;
        case 'exam': return ExamReport;
        case 'attendance': return AttendanceReport;
        case 'finance': return FinanceReport;
        case 'payroll': return PayrollReport;
        default: throw new Error('Invalid report type');
    }
};

// Report generation helper functions
const generateStudentReport = async (filters, format, userId) => {
    // Implementation
};

const generateExamReport = async (filters, format, userId) => {
    // Implementation
};

const generateAttendanceReport = async (filters, format, userId) => {
    // Implementation
};

const generateFinanceReport = async (filters, format, userId) => {
    // Implementation
};

const generatePayrollReport = async (filters, format, userId) => {
    // Implementation
};

module.exports = exports;