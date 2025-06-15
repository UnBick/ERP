const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const StudentAttendance = require('../models/studentAttendanceModel');
const Student = require('../models/studentModel');
const Class = require('../../academic/models/classModel');
const Section = require('../../academic/models/sectionModel');
const { validateDate } = require('../../../utils/dateUtils');
const { sendNotification } = require('../../../utils/notificationUtils');

exports.getStudentsByClass = async (req, res) => {
  try {
    const { classId, sectionId } = req.query;

    if (!classId || !sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Class and section IDs are required'
      });
    }

    const students = await Student.find({
      'academicInfo.class': classId,
      'academicInfo.section': sectionId,
      isActive: true
    })
    .select('enrollmentNumber personalInfo.firstName personalInfo.lastName academicInfo.rollNumber')
    .sort({ 'academicInfo.rollNumber': 1 })
    .lean();

    const transformedStudents = students.map(student => ({
      id: student._id,
      enrollmentNumber: student.enrollmentNumber,
      name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
      rollNumber: student.academicInfo.rollNumber
    }));

    return res.status(200).json({
      success: true,
      data: transformedStudents
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
};

exports.submitAttendance = async (req, res) => {
  try {
    const { date, classId, sectionId, attendance, submittedBy } = req.body;

    // Validate input
    if (!date || !classId || !sectionId || !attendance) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if attendance already exists for this date and class/section
    const existingAttendance = await StudentAttendance.findOne({
      date: new Date(date),
      classId,
      sectionId
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date'
      });
    }

    // Create attendance records
    const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
      student: studentId,
      classId,
      sectionId,
      date: new Date(date),
      status,
      markedBy: submittedBy,
      createdAt: new Date()
    }));

    await StudentAttendance.insertMany(attendanceRecords);

    return res.status(200).json({
      success: true,
      message: 'Attendance submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting attendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting attendance',
      error: error.message
    });
  }
};

exports.getAttendance = catchAsync(async (req, res) => {
    const { classId, sectionId, date } = req.query;

    const attendance = await StudentAttendance.find({
        class: classId,
        section: sectionId,
        date: new Date(date)
    })
    .populate('student', 'rollNo name')
    .populate('markedBy', 'name');

    res.json(ApiResponse.success('Attendance retrieved successfully', attendance));
});

exports.getAttendanceStatistics = catchAsync(async (req, res) => {
    const { classId, sectionId, startDate, endDate } = req.query;

    const dateFilter = {
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    };

    if (classId) dateFilter.class = classId;
    if (sectionId) dateFilter.section = sectionId;

    const stats = await StudentAttendance.aggregate([
        { $match: dateFilter },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Calculate percentages
    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const formattedStats = stats.reduce((acc, curr) => {
        acc[curr._id] = {
            count: curr.count,
            percentage: ((curr.count / total) * 100).toFixed(2)
        };
        return acc;
    }, {});

    res.json(ApiResponse.success('Statistics retrieved successfully', formattedStats));
});

exports.updateAttendance = catchAsync(async (req, res) => {
    const { attendanceId } = req.params;
    const { status } = req.body;

    const attendance = await StudentAttendance.findByIdAndUpdate(
        attendanceId,
        {
            status,
            lastModifiedBy: req.user._id,
            lastModifiedAt: new Date()
        },
        { new: true }
    );

    if (!attendance) {
        return res.status(404).json(
            ApiResponse.error('Attendance record not found')
        );
    }

    res.json(ApiResponse.success('Attendance updated successfully', attendance));
});

exports.getMonthlyReport = catchAsync(async (req, res) => {
    const { classId, sectionId, month, year } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const report = await StudentAttendance.aggregate([
        {
            $match: {
                class: classId,
                section: sectionId,
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    student: '$student',
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
                },
                status: { $first: '$status' }
            }
        },
        {
            $group: {
                _id: '$_id.student',
                attendance: {
                    $push: {
                        date: '$_id.date',
                        status: '$status'
                    }
                },
                totalPresent: {
                    $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                },
                totalAbsent: {
                    $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                },
                totalLate: {
                    $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: 'students',
                localField: '_id',
                foreignField: '_id',
                as: 'studentInfo'
            }
        }
    ]);

    res.json(ApiResponse.success('Monthly report generated successfully', report));
});

module.exports = exports;