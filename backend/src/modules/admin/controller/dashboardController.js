const catchAsync = require('../../../utils/catchAsync');
const Student = require('../../student/models/studentModel');
const Teacher = require('../../teacher/models/teacherModel');
const Attendance = require('../../academic/models/attendanceModel');
const Fee = require('../../fees/models/feeModel');

const dashboardController = {
    getDashboardStats: async (req, res) => {
        try {
            const { range = 'week' } = req.query;

            // Get total counts
            const totalStudents = await Student.countDocuments({ isActive: true });
            const totalTeachers = await Teacher.countDocuments({ isActive: true });

            // Get today's attendance percentage
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todayAttendance = await Attendance.aggregate([
                { $match: { date: today } },
                { $group: {
                    _id: null,
                    present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
                    total: { $sum: 1 }
                }}
            ]);

            const attendancePercentage = todayAttendance.length > 0 
                ? Math.round((todayAttendance[0].present / todayAttendance[0].total) * 100)
                : 0;

            // Get fee collection
            const feeCollection = await Fee.aggregate([
                { $match: { 
                    paymentDate: { 
                        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }},
                { $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }}
            ]);

            // Get attendance trends based on time range
            let dateRange;
            switch(range) {
                case 'month':
                    dateRange = 30;
                    break;
                case 'year':
                    dateRange = 365;
                    break;
                default: // week
                    dateRange = 7;
            }

            const attendanceTrends = await Attendance.aggregate([
                {
                    $match: {
                        date: {
                            $gte: new Date(new Date().setDate(new Date().getDate() - dateRange))
                        }
                    }
                },
                {
                    $group: {
                        _id: { 
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                            userType: "$userType"
                        },
                        present: { 
                            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$_id.date",
                        students: {
                            $sum: { 
                                $cond: [
                                    { $eq: ["$_id.userType", "student"] },
                                    "$present",
                                    0
                                ]
                            }
                        },
                        teachers: {
                            $sum: { 
                                $cond: [
                                    { $eq: ["$_id.userType", "teacher"] },
                                    "$present",
                                    0
                                ]
                            }
                        }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            const response = {
                data: {
                    totalStudents,
                    totalTeachers,
                    attendance: attendancePercentage,
                    feeCollection: feeCollection.length > 0 ? feeCollection[0].total : 0,
                    attendanceTrends: attendanceTrends.map(trend => ({
                        date: trend._id,
                        students: trend.students,
                        teachers: trend.teachers
                    }))
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).json({ 
                message: 'Error fetching dashboard stats', 
                error: error.message 
            });
        }
    },

    getAnalytics: async (req, res) => {
        try {
            // TODO: Implement actual analytics data
            const analytics = {
                performanceMetrics: {},
                financialMetrics: {},
                attendanceMetrics: {}
            };
            
            res.status(200).json(analytics);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching analytics', error: error.message });
        }
    }
};

module.exports = dashboardController;