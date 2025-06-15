const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const StudentAttendance = require('../models/studentAttendanceModel');
const Student = require('../models/studentModel');
const LeaveRequest = require('../models/leaveRequestModel');
const mongoose = require('mongoose');

exports.getAttendance = catchAsync(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
        return res.status(404).json(
            ApiResponse.error('Student record not found')
        );
    }

    const { month, year } = req.query;
    let dateFilter = { student: student._id };
    
    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        dateFilter.date = {
            $gte: startDate,
            $lte: endDate
        };
    }

    const attendance = await StudentAttendance.find(dateFilter)
        .sort({ date: -1 })
        .select('date status remarks createdAt')
        .lean();

    res.json(ApiResponse.success('Attendance records retrieved successfully', attendance));
});

exports.getAttendanceStats = catchAsync(async (req, res) => {
    // First find the student record
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
        return res.status(404).json(
            ApiResponse.error('Student record not found')
        );
    }

    const { startDate, endDate } = req.query;
    let dateFilter = { student: student._id };
    
    if (startDate && endDate) {
        dateFilter.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const records = await StudentAttendance.find(dateFilter);
    
    const stats = {
        totalDays: records.length,
        presentDays: records.filter(r => r.status === 'present').length,
        absentDays: records.filter(r => r.status === 'absent').length,
        lateDays: records.filter(r => r.status === 'late').length,
        attendanceRate: 0
    };

    stats.attendanceRate = stats.totalDays 
        ? ((stats.presentDays + stats.lateDays) / stats.totalDays * 100).toFixed(2)
        : 0;

    res.json(ApiResponse.success('Attendance statistics retrieved successfully', stats));
});

exports.submitLeaveRequest = catchAsync(async (req, res) => {
    const { from, to, reason } = req.body;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Validate dates
    if (fromDate > toDate) {
        return res.status(400).json(
            ApiResponse.error('From date cannot be after to date')
        );
    }

    if (fromDate < new Date()) {
        return res.status(400).json(
            ApiResponse.error('Cannot submit leave request for past dates')
        );
    }

    // Check for existing leave requests
    const existingRequests = await LeaveRequest.find({
        student: req.user._id,
        status: { $in: ['pending', 'approved'] },
        $or: [
            {
                fromDate: { $lte: toDate },
                toDate: { $gte: fromDate }
            }
        ]
    });

    if (existingRequests.length > 0) {
        return res.status(400).json(
            ApiResponse.error('Overlapping leave request exists')
        );
    }

    const leaveRequest = await LeaveRequest.create({
        student: req.user._id,
        fromDate,
        toDate,
        reason,
        class: req.user.class,
        section: req.user.section,
        status: 'pending'
    });

    res.status(201).json(
        ApiResponse.success('Leave request submitted successfully', leaveRequest)
    );
});

exports.getLeaveRequests = catchAsync(async (req, res) => {
    const leaveRequests = await LeaveRequest.find({ 
        student: req.user._id 
    })
    .sort({ createdAt: -1 })
    .populate('approvedBy', 'name');

    res.json(
        ApiResponse.success('Leave requests retrieved successfully', leaveRequests)
    );
});

exports.cancelLeaveRequest = catchAsync(async (req, res) => {
    const { requestId } = req.params;

    const leaveRequest = await LeaveRequest.findOne({
        _id: requestId,
        student: req.user._id,
        status: 'pending'
    });

    if (!leaveRequest) {
        return res.status(404).json(
            ApiResponse.error('Leave request not found or cannot be cancelled')
        );
    }

    leaveRequest.status = 'cancelled';
    await leaveRequest.save();

    res.json(
        ApiResponse.success('Leave request cancelled successfully', leaveRequest)
    );
});

module.exports = exports;