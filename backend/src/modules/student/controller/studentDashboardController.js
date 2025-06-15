const catchAsync = require('../../../utils/catchAsync');
const mongoose = require('mongoose');
const Student = require('../models/studentModel');
const User = require('../../auth/models/userModel');

// Helper Functions
const calculatePerformanceStats = (grades) => {
    if (!grades.length) {
        return {
            overall: 0,
            totalSubjects: 0,
            monthlyProgress: []
        };
    }

    const subjects = new Set(grades.map(g => g.subject._id.toString()));
    
    // Calculate overall percentage
    const overall = grades.reduce((acc, grade) => 
        acc + (grade.marks / grade.totalMarks) * 100, 0) / grades.length;

    // Calculate monthly progress
    const monthlyData = {};
    grades.forEach(grade => {
        const month = grade.createdAt.toLocaleString('default', { month: 'short' });
        if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, count: 0 };
        }
        monthlyData[month].total += (grade.marks / grade.totalMarks) * 100;
        monthlyData[month].count++;
    });

    const monthlyProgress = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        score: Math.round(data.total / data.count)
    }));

    return {
        overall: Math.round(overall),
        totalSubjects: subjects.size,
        monthlyProgress
    };
};

const calculateAttendanceStats = (attendance) => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    
    return {
        percentage: total ? Math.round((present / total) * 100) : 0,
        total,
        present,
        absent: total - present
    };
};

// Main controller function
const getDashboardData = catchAsync(async (req, res) => {
    console.log('Starting dashboard request for user:', req.user?._id);

    if (!req.user?._id) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    try {
        // First check if any students exist
        const sampleStudent = await Student.findOne().lean();
        console.log('Sample student data:', {
            id: sampleStudent?._id,
            hasUser: 'user' in (sampleStudent || {}),
            fields: Object.keys(sampleStudent || {})
        });

        // Try to find by email instead of user ID as fallback
        const studentByEmail = await Student.findOne({
            'contactInfo.email': req.user.email
        }).lean();

        console.log('Student lookup by email:', {
            found: !!studentByEmail,
            email: req.user.email
        });

        // Use found student or continue with original query
        const student = await Student.findOne({
            'contactInfo.email': req.user.email
        })
        .populate({
            path: 'academicInfo.class',
            select: 'name level',
            options: { lean: true }
        })
        .populate({
            path: 'academicInfo.section',
            select: 'name',
            options: { lean: true }
        })
        .populate({
            path: 'academicInfo.subjects',
            select: 'name code',
            options: { lean: true }
        })
        .lean();

        console.log('Found student data:', {
            class: student?.academicInfo?.class,
            section: student?.academicInfo?.section
        });

        if (!student) {
            // Log all available students for debugging
            const studentSample = await Student.find()
                .limit(1)
                .select('contactInfo.email personalInfo.firstName user')
                .lean();

            console.log('Sample student record:', studentSample[0]);

            return res.status(404).json({
                success: false,
                message: 'Student profile not found',
                debug: {
                    userId: req.user._id.toString(),
                    userEmail: req.user.email,
                    searchAttempted: {
                        byId: true,
                        byEmail: true
                    }
                }
            });
        }

        // If student found by email but missing user field, update it
        if (studentByEmail && !studentByEmail.user) {
            await Student.updateOne(
                { _id: studentByEmail._id },
                { $set: { user: req.user._id } }
            );
            console.log('Updated student with user ID');
        }

        // Format response data
        const dashboardData = {
            profile: {
                name: student.personalInfo ? 
                    `${student.personalInfo.firstName} ${student.personalInfo.lastName}`.trim() : 'N/A',
                class: student.academicInfo?.class?.name?.replace('Class ', '') || 'N/A',
                section: student.academicInfo?.section?.name || 'N/A',
                rollNo: student.academicInfo?.rollNumber || 'N/A',
                semester: student.academicInfo?.class?.level || 'N/A',
                avatar: student.personalInfo?.avatar || null,
                rank: 'N/A'
            },
            performanceStats: {
                overall: student.academicInfo?.overallPerformance || 0,
                totalSubjects: (student.academicInfo?.subjects || []).length,
                activities: 0, // Add actual activities count if available
                monthlyProgress: [] // Add actual progress data if available
            },
            attendance: {
                percentage: student.attendance?.attendancePercentage || 0,
                total: (student.attendance?.totalPresent || 0) + (student.attendance?.totalAbsent || 0),
                present: student.attendance?.totalPresent || 0,
                absent: student.attendance?.totalAbsent || 0
            },
            assignments: [], // Add actual assignments if available
            notifications: [] // Add actual notifications if available
        };

        console.log('Sending dashboard data:', dashboardData); // Debug log

        return res.status(200).json({
            success: true,
            message: 'Dashboard data retrieved successfully',
            data: dashboardData
        });

    } catch (error) {
        console.error('Dashboard error:', {
            message: error.message,
            stack: error.stack,
            userId: req.user._id
        });
        return res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
});

module.exports = {
    getDashboardData
};