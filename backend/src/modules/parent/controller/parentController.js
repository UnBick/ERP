const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Parent = require('../models/parentModel');
const Student = require('../../student/models/studentModel');
const StudentAttendance = require('../../student/models/attendanceModel');
const Exam = require('../../exams/models/examModel');

exports.getChildren = catchAsync(async (req, res) => {
    const parent = await Parent.findOne({ user: req.user._id })
        .populate({
            path: 'children',
            select: 'personalInfo academicInfo',
            populate: [
                { 
                    path: 'academicInfo.class',
                    select: 'name' 
                },
                { 
                    path: 'academicInfo.section',
                    select: 'name' 
                }
            ]
        });

    if (!parent) {
        return res.status(404).json(
            ApiResponse.error('Parent record not found')
        );
    }

    const children = parent.children.map(child => ({
        id: child._id,
        name: `${child.personalInfo?.firstName || ''} ${child.personalInfo?.lastName || ''}`.trim(),
        class: child.academicInfo?.class?.name || 'N/A',
        section: child.academicInfo?.section?.name || 'N/A',
        rollNumber: child.academicInfo?.rollNumber || 'N/A',
        studentInfo: {
            name: `${child.personalInfo?.firstName || ''} ${child.personalInfo?.lastName || ''}`.trim(),
            class: child.academicInfo?.class?.name || 'N/A',
            section: child.academicInfo?.section?.name || 'N/A',
            rollNo: child.academicInfo?.rollNumber || 'N/A'
        }
    }));

    res.json(ApiResponse.success('Children retrieved successfully', children));
});

exports.getDashboard = catchAsync(async (req, res) => {
    console.log('Finding parent with user ID:', req.user._id);
    
    // First find the parent
    const parent = await Parent.findOne({ user: req.user._id })
        .populate({
            path: 'children',
            populate: [
                { path: 'academicInfo.class', select: 'name' },
                { path: 'academicInfo.section', select: 'name' },
                { path: 'personalInfo' }
            ]
        });

    if (!parent) {
        return res.status(404).json(
            ApiResponse.error('Parent record not found')
        );
    }

    console.log('Found parent:', {
        id: parent._id,
        childrenCount: parent.children?.length || 0
    });

    // Get children data with attendance and exam results
    const childrenData = await Promise.all(parent.children.map(async (child) => {
        // Get attendance stats
        const attendance = await StudentAttendance.aggregate([
            {
                $match: { student: child._id }
            },
            {
                $group: {
                    _id: null,
                    totalDays: { $sum: 1 },
                    presentDays: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    }
                }
            }
        ]);

        return {
            id: child._id,
            studentInfo: {
                name: `${child.personalInfo?.firstName || ''} ${child.personalInfo?.lastName || ''}`.trim() || 'N/A',
                class: child.academicInfo?.class?.name || 'N/A',
                section: child.academicInfo?.section?.name || 'N/A',
                rollNo: child.academicInfo?.rollNumber || 'N/A'
            },
            attendance: {
                percentage: attendance[0] ? 
                    ((attendance[0].presentDays / attendance[0].totalDays) * 100).toFixed(1) : '0',
                present: attendance[0]?.presentDays || 0,
                absent: (attendance[0]?.totalDays || 0) - (attendance[0]?.presentDays || 0)
            }
        };
    }));

    // Add mock data
    const mockData = {
        upcomingEvents: [
            { title: 'Parent-Teacher Meeting', date: new Date() }
        ],
        teacherRemarks: [
            {
                subject: 'General',
                teacher: 'Class Teacher',
                date: new Date(),
                comment: 'Good progress this month'
            }
        ],
        fees: {
            dueAmount: 5000,
            status: 'Pending'
        }
    };

    const responseData = {
        parent: {
            name: parent.name,
            email: parent.email,
            contact: parent.contact
        },
        children: childrenData,
        ...mockData
    };

    console.log('Sending dashboard data:', {
        parentId: parent._id,
        childrenCount: childrenData.length
    });

    res.json(ApiResponse.success('Dashboard data retrieved successfully', responseData));
});

// Helper function to calculate average grade
const calculateAverageGrade = (examResults) => {
    if (!examResults.length) return 'N/A';
    
    const totalPercentage = examResults.reduce((sum, exam) => {
        return sum + ((exam.marks / exam.totalMarks) * 100);
    }, 0);
    
    const averagePercentage = totalPercentage / examResults.length;
    return getGrade(averagePercentage);
};

const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
};
