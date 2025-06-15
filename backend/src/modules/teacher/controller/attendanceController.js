const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Teacher = require('../models/teacherModel');
const Student = require('../../student/models/studentModel');
const TeacherAttendance = require('../models/teacherAttendanceModel');
const StudentAttendance = require('../models/studentAttendanceModel');
const { validateLocation } = require('../../../utils/locationUtil');

// Self Attendance Controllers
exports.markSelfAttendance = catchAsync(async (req, res) => {
    const { location, timestamp, type } = req.body;
    console.log('Attendance request:', { type, userId: req.user._id });

    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
        return res.status(404).json(ApiResponse.error('Teacher not found'));
    }

    // Set date to start of day for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        // Find existing attendance for today
        const existingAttendance = await TeacherAttendance.findOne({
            teacher: teacher._id,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        console.log('Existing attendance:', existingAttendance);

        if (type === 'checkOut') {
            if (!existingAttendance) {
                return res.status(400).json({
                    success: false,
                    message: 'No check-in record found for today'
                });
            }

            existingAttendance.checkOut = new Date();
            await existingAttendance.save();

            return res.json({
                success: true,
                message: 'Check-out recorded successfully',
                data: existingAttendance
            });
        }

        if (type === 'checkIn') {
            if (existingAttendance?.checkIn) {
                return res.status(400).json({
                    success: false,
                    message: 'Already checked in today'
                });
            }

            const attendance = await TeacherAttendance.create({
                teacher: teacher._id,
                date: new Date(),
                checkIn: new Date(),
                location,
                status: 'present'
            });

            return res.status(201).json({
                success: true,
                message: 'Check-in recorded successfully',
                data: attendance
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid attendance type'
        });

    } catch (error) {
        console.error('Attendance marking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to mark attendance'
        });
    }
});

exports.getAttendanceHistory = catchAsync(async (req, res) => {
    const teacher = await Teacher.findOne({ user: req.user._id });
    
    console.log('Fetching history for teacher:', teacher._id);

    const history = await TeacherAttendance.find({ 
        teacher: teacher._id,
        date: { 
            $gte: new Date(new Date().setDate(1)) // Current month
        }
    })
    .sort('-date')
    .lean();

    console.log('Found attendance records:', {
        count: history.length,
        sample: history[0]
    });

    const formattedHistory = history.map(record => ({
        id: record._id.toString(),
        date: record.date,
        checkIn: record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A',
        checkOut: record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'N/A',
        status: record.status
    }));

    return res.json({
        success: true,
        message: 'Attendance history retrieved',
        data: formattedHistory
    });
});

exports.getAttendanceStats = catchAsync(async (req, res) => {
    const teacher = await Teacher.findOne({ user: req.user._id });

    // Calculate current month stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const records = await TeacherAttendance.find({
        teacher: teacher._id,
        date: { $gte: monthStart }
    }).lean();

    const stats = {
        totalDays: records.length,
        presentDays: records.filter(r => r.status === 'present').length,
        leaveDays: records.filter(r => r.status === 'leave').length,
        attendance_percentage: 0
    };

    stats.attendance_percentage = stats.totalDays > 0 
        ? ((stats.presentDays / stats.totalDays) * 100).toFixed(1)
        : 0;

    console.log('Calculated stats:', stats);

    return res.json({
        success: true,
        message: 'Stats retrieved successfully',
        data: stats
    });
});

// Student Attendance Controllers
exports.markStudentAttendance = catchAsync(async (req, res) => {
    console.log('Marking attendance:', {
        teacherId: req.user._id,
        body: req.body
    });

    const teacher = await Teacher.findOne({ user: req.user._id })
        .populate('classTeacherFor')
        .lean();

    if (!teacher) {
        return res.status(404).json(ApiResponse.error('Teacher not found'));
    }

    try {
        const attendanceDate = new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        const attendanceRecords = await Promise.all(
            Object.entries(req.body).map(([studentId, isPresent]) => 
                StudentAttendance.create({
                    student: studentId,
                    date: attendanceDate,
                    status: isPresent ? 'present' : 'absent',
                    markedBy: teacher._id,
                    section: teacher.classTeacherFor._id,
                    remarks: 'Marked by class teacher'
                })
            )
        );

        console.log('Created attendance records:', {
            count: attendanceRecords.length,
            date: attendanceDate
        });

        return res.status(201).json({
            success: true,
            message: 'Student attendance marked successfully',
            data: {
                recordsCreated: attendanceRecords.length,
                date: attendanceDate
            }
        });

    } catch (error) {
        console.error('Error marking attendance:', error);
        return res.status(500).json(ApiResponse.error(
            'Failed to mark attendance: ' + error.message
        ));
    }
});

exports.getStudents = catchAsync(async (req, res) => {
    console.log('Fetching students for teacher:', req.user._id);
    
    const teacher = await Teacher.findOne({ user: req.user._id })
        .populate('classTeacherFor')
        .lean();

    console.log('Found teacher:', {
        id: teacher?._id,
        isClassTeacher: !!teacher?.classTeacherFor,
        classTeacherFor: teacher?.classTeacherFor?._id,
        hasUser: !!teacher?.user,
        classDetails: teacher?.classTeacherFor
    });

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher not found'
        });
    }

    if (!teacher.classTeacherFor) {
        return res.json({
            success: true,
            message: 'No class assigned to teacher',
            data: []
        });
    }

    // Update query to match section instead of class
    const studentQuery = {
        'academicInfo.section': teacher.classTeacherFor._id,
        isActive: true
    };

    console.log('Executing student query:', studentQuery);

    const students = await Student.find(studentQuery)
        .select('personalInfo.firstName personalInfo.lastName academicInfo.rollNumber')
        .sort('academicInfo.rollNumber')
        .lean();

    console.log('Found students:', {
        count: students.length,
        sectionId: teacher.classTeacherFor._id,
        query: studentQuery
    });

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
            total: formattedStudents.length,
            sectionId: teacher.classTeacherFor._id,
            sectionName: teacher.classTeacherFor.name
        }
    });
});

exports.checkTeacherRole = catchAsync(async (req, res) => {
    const teacher = await Teacher.findOne({ user: req.user._id })
        .populate('classTeacherFor');
    
    res.json({
        success: true,
        data: {
            isClassTeacher: Boolean(teacher?.classTeacherFor),
            classTeacherFor: teacher?.classTeacherFor || null
        }
    });
});

exports.requestLeave = catchAsync(async (req, res) => {
    const { startDate, endDate, reason, type } = req.body;
    const teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
        return res.status(404).json(ApiResponse.error('Teacher not found'));
    }

    try {
        const leave = await TeacherAttendance.create({
            teacher: teacher._id,
            date: new Date(startDate),
            endDate: new Date(endDate),
            status: 'leave',
            leaveType: type,
            reason,
            // Don't set checkIn for leave requests
        });

        return res.status(201).json(ApiResponse.success('Leave request submitted successfully', leave));
    } catch (error) {
        console.error('Leave request error:', error);
        return res.status(400).json(ApiResponse.error(
            'Failed to submit leave request: ' + error.message
        ));
    }
});

module.exports = exports;