const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Staff = require('../../staff/models/staffModel');
const Student = require('../../student/models/studentModel');
const StudentAttendance = require('../models/studentAttendanceModel');
const Schedule = require('../../academic/models/scheduleModel');

exports.getDashboardData = async (req, res) => {
    try {
        console.log('Debug - Auth User:', {
            userId: req.user._id,
            email: req.user.email
        });

        // Find teacher in the teachers collection
        const teacher = await Staff.findOne({
            $or: [
                { user: req.user._id },
                { email: req.user.email },
                { staffID: req.user.staffID }
            ],
            roles: { $in: ['Teacher', 'Class Teacher'] }
        })
        .select('name staffID email department designation isClassTeacher classTeacherFor roles')
        .populate('classTeacherFor');

        console.log('Debug - Found Teacher:', {
            found: !!teacher,
            teacherId: teacher?._id,
            name: teacher?.name,
            email: teacher?.email,
            isClassTeacher: teacher?.isClassTeacher,
            roles: teacher?.roles
        });

        if (!teacher) {
            // Try to find by any matching field
            const allTeachers = await Staff.find({}).lean();
            console.log('Debug - All Teachers:', allTeachers.map(t => ({
                id: t._id,
                name: t.name,
                email: t.email,
                staffID: t.staffID
            })));

            return res.status(404).json({
                success: false,
                message: 'Teacher profile not found',
                debug: {
                    searchCriteria: {
                        userId: req.user._id,
                        email: req.user.email,
                        staffID: req.user.staffID
                    }
                }
            });
        }

        let studentStats = {
            totalStudents: 0,
            attendanceRate: 0,
            section: null
        };

        if (teacher.isClassTeacher && teacher.classTeacherFor) {
            const totalStudents = await Student.countDocuments({
                'academicInfo.section': teacher.classTeacherFor._id,
                isActive: true
            });

            studentStats = {
                totalStudents,
                attendanceRate: 0,
                section: {
                    id: teacher.classTeacherFor._id,
                    name: teacher.classTeacherFor.name,
                    class: teacher.class?.name || 'N/A'
                }
            };
        }

        const dashboardData = {
            teacherInfo: {
                id: teacher._id,
                name: teacher.name,
                staffID: teacher.staffID,
                email: teacher.email,
                department: teacher.department,
                designation: teacher.designation,
                isClassTeacher: teacher.isClassTeacher,
                roles: teacher.roles || ['Teacher']
            },
            studentStats,
            upcomingClasses: [{
                subject: 'Sample Class',
                time: '10:00 AM',
                class: `${teacher.class?.name || ''}`
            }],
            activeStudents: studentStats.totalStudents,
            recentNotifications: [{
                title: 'Welcome',
                message: `Welcome back, ${teacher.name}!`,
                date: new Date(),
                type: 'info'
            }]
        };

        return res.json({
            success: true,
            message: 'Dashboard data retrieved successfully',
            data: dashboardData
        });

    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Placeholder method implementations
exports.getTodayClasses = async (req, res) => {
    res.json({ success: true, data: [] });
};

exports.getPendingAssignments = async (req, res) => {
    res.json({ success: true, data: [] });
};

exports.getRecentNotifications = async (req, res) => {
    res.json({ success: true, data: [] });
};

exports.getTodayAttendance = async (req, res) => {
    res.json({ success: true, data: {} });
};

exports.getUpcomingEvents = async (req, res) => {
    res.json({ success: true, data: [] });
};

exports.getStudentStats = async (req, res) => {
    res.json({ success: true, data: {} });
};

exports.getTeachersBySubject = catchAsync(async (req, res) => {
    const { subject } = req.query;
    
    if (!subject) {
        return res.status(400).json(ApiResponse.error('Subject parameter is required'));
    }

    try {
        // Modified query to be more flexible
        const teachers = await Staff.find({
            roles: { $in: ['Teacher'] },
            isActive: true,
            $or: [
                { 'teachingAssignments.subject.name': subject },
                { 'subjectTeacherFor.subject.name': subject },
                { department: subject }
            ]
        })
        .select('_id name department designation teachingAssignments')
        .lean();

        if (!teachers || teachers.length === 0) {
            return res.json(ApiResponse.success('No teachers found for this subject', []));
        }

        // Map the response to match frontend expectations
        const mappedTeachers = teachers.map(teacher => ({
            _id: teacher._id,
            name: teacher.name,
            department: teacher.department || subject,
            designation: teacher.designation || 'Teacher'
        }));

        res.json(ApiResponse.success('Teachers retrieved successfully', mappedTeachers));

    } catch (error) {
        console.error('Error in getTeachersBySubject:', error);
        res.status(500).json(ApiResponse.error('Failed to fetch teachers: ' + error.message));
    }
});

// Helper Functions
const formatTime = (time) => {
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const calculateStudentStats = async (teacherId) => {
  const stats = await Student.aggregate([
    {
      $match: {
        teacher: teacherId,
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        attendanceRate: { $avg: '$attendanceRate' },
        averagePerformance: { $avg: '$performanceScore' }
      }
    }
  ]);

  return stats[0] || {
    totalStudents: 0,
    attendanceRate: 0,
    averagePerformance: 0
  };
};