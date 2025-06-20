const mongoose = require('mongoose');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Parent = require('../models/parentModel');
const Student = require('../../student/models/studentModel');
const StudentAttendance = require('../../student/models/studentAttendanceModel');
const Attendance = require('../../student/models/attendanceModel');
const LeaveRequest = require('../../student/models/LeaveRequestModel');

exports.getAttendance = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const { month, year } = req.query;

    // Verify parent has access to this student
    const parent = await Parent.findOne({ 
        user: req.user._id,
        children: studentId 
    });

    if (!parent) {
        return res.status(403).json(
            ApiResponse.error('Not authorized to view this student\'s attendance')
        );
    }

    let dateFilter = { student: studentId };
    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await StudentAttendance.find(dateFilter)
        .sort({ date: -1 })
        .select('date status remarks')
        .lean();

    res.json(ApiResponse.success('Attendance records retrieved', attendance));
});

exports.getAttendanceStats = catchAsync(async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Verify parent has access to this student
        const parent = await Parent.findOne({ 
            user: req.user._id,
            children: studentId 
        });

        if (!parent) {
            return res.status(403).json(
                ApiResponse.error('Not authorized to view this student\'s attendance')
            );
        }

        const stats = await StudentAttendance.aggregate([
            { 
                $match: { 
                    student: new mongoose.Types.ObjectId(studentId)
                } 
            },
            {
                $group: {
                    _id: null,
                    totalDays: { $sum: 1 },
                    presentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    },
                    absentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                    },
                    lateDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
                    }
                }
            }
        ]);

        const attendanceStats = stats[0] || {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0
        };

        attendanceStats.attendanceRate = attendanceStats.totalDays 
            ? ((attendanceStats.presentDays / attendanceStats.totalDays) * 100).toFixed(2)
            : 0;

        console.log('Attendance stats:', attendanceStats);

        return res.json(ApiResponse.success('Attendance statistics retrieved', attendanceStats));
    } catch (error) {
        console.error('Error in getAttendanceStats:', error);
        return res.status(500).json(
            ApiResponse.error('Error retrieving attendance statistics')
        );
    }
});

exports.getStudentAttendance = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json(ApiResponse.error('Student not found'));
    }

    const attendance = await Attendance.find({
        student: studentId,
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort('date');

    const summary = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        percentage: attendance.length ? 
            (attendance.filter(a => a.status === 'present').length / attendance.length) * 100 : 0
    };

    res.json(ApiResponse.success('Attendance retrieved successfully', { attendance, summary }));
});

exports.getAttendanceSummary = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const { month, year } = req.query;

    const monthlyAttendance = await Attendance.aggregate([
        {
            $match: {
                student: mongoose.Types.ObjectId(studentId),
                date: {
                    $gte: new Date(year, month - 1, 1),
                    $lte: new Date(year, month, 0)
                }
            }
        },
        {
            $group: {
                _id: { $dayOfMonth: "$date" },
                status: { $first: "$status" }
            }
        }
    ]);

    res.json(ApiResponse.success('Monthly attendance summary retrieved', monthlyAttendance));
});

exports.getLeaveRequests = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const { status } = req.query;

    const query = { student: studentId };
    if (status) {
        query.status = status;
    }

    const leaveRequests = await LeaveRequest.find(query)
        .sort('-createdAt');

    res.json(ApiResponse.success('Leave requests retrieved successfully', leaveRequests));
});

exports.submitLeaveRequest = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const { startDate, endDate, reason, type } = req.body;

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json(ApiResponse.error('Start date cannot be after end date'));
    }

    const leaveRequest = await LeaveRequest.create({
        student: studentId,
        startDate,
        endDate,
        reason,
        type,
        requestedBy: req.user._id
    });

    res.status(201).json(ApiResponse.success('Leave request submitted successfully', leaveRequest));
});

exports.cancelLeaveRequest = catchAsync(async (req, res) => {
    const { requestId } = req.params;

    const leaveRequest = await LeaveRequest.findOneAndUpdate(
        { 
            _id: requestId,
            status: 'pending'
        },
        { status: 'cancelled' },
        { new: true }
    );

    if (!leaveRequest) {
        return res.status(400).json(ApiResponse.error('Leave request cannot be cancelled'));
    }

    res.json(ApiResponse.success('Leave request cancelled successfully', leaveRequest));
});
