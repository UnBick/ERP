const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Parent = require('../models/ParentModel');
const Student = require('../../student/models/studentModel');
const Attendance = require('../../student/models/attendanceModel');
const Fee = require('../../fees/models/feeModel');
const Assignment = require('../../predefinesyllabus/models/assignmentModel');
//const Notice = require('../../communication/models/Notice');
//const Event = require('../../events/models/Event');
//const Message = require('../../communication/models/Message');
const Exam = require('../../exams/models/examModel');

// Dashboard Overview
exports.getDashboardOverview = catchAsync(async (req, res) => {
    console.log('Processing parent dashboard request with user:', req.user?._id);

    // Find parent with student info
    const parent = await Parent.findOne({ user: req.user._id }).lean();
    console.log('Parent found:', {
        parentId: parent?._id,
        hasChildren: !!parent?.children?.length
    });

    if (!parent) {
        return res.status(404).json({
            success: false,
            message: 'Parent profile not found'
        });
    }

    // Find all students associated with this parent
    const students = await Student.find({ parent: parent._id })
        .populate({
            path: 'academicInfo.class',
            select: 'name level',
            populate: {
                path: 'section',
                select: 'name'
            }
        })
        .populate('academicInfo.section', 'name')
        .lean();

    console.log('Students found:', {
        count: students.length,
        studentIds: students.map(s => s._id)
    });

    if (!students.length) {
        return res.status(200).json({
            success: true,
            message: 'No students linked to parent profile',
            data: {
                studentInfo: {
                    name: 'No Student Linked',
                    class: 'N/A',
                    section: 'N/A',
                    rollNo: 'N/A'
                },
                attendance: {
                    percentage: 0,
                    present: 0,
                    absent: 0
                },
                fees: {
                    dueAmount: 0,
                    status: 'N/A'
                },
                upcomingEvents: [],
                assignments: [],
                teacherRemarks: []
            }
        });
    }

    // Get first student's data
    const firstStudent = students[0];
    const dashboardData = {
        studentInfo: {
            name: `${firstStudent.personalInfo?.firstName} ${firstStudent.personalInfo?.lastName}`,
            class: firstStudent.academicInfo?.class?.name?.replace('Class ', ''),
            section: firstStudent.academicInfo?.section?.name,  // Added section here
            rollNo: firstStudent.academicInfo?.rollNumber
        },
        attendance: {
            percentage: firstStudent.attendance?.attendancePercentage || 0,
            present: firstStudent.attendance?.totalPresent || 0,
            absent: firstStudent.attendance?.totalAbsent || 0
        },
        fees: {
            dueAmount: firstStudent.fees?.pendingAmount || 0,
            status: firstStudent.fees?.pendingAmount > 0 ? 'Pending' : 'Paid'
        },
        upcomingEvents: [],
        assignments: [],
        teacherRemarks: []
    };

    console.log('Sending dashboard data:', dashboardData);

    return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboardData
    });
});

// Children Summary
exports.getChildrenSummary = catchAsync(async (req, res) => {
    const parent = await Parent.findById(req.user.parentId)
        .populate({
            path: 'children',
            select: 'name rollNumber class section',
            populate: [
                { path: 'class', select: 'name' },
                { path: 'section', select: 'name' }
            ]
        });

    if (!parent) {
        return res.status(404).json(ApiResponse.error('Parent not found'));
    }

    res.json(ApiResponse.success('Children summary retrieved successfully', parent.children));
});

// Child Details
exports.getChildDetails = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findOne({
        _id: studentId,
        parent: req.user.parentId
    }).populate('class section');

    if (!student) {
        return res.status(404).json(ApiResponse.error('Student not found'));
    }

    res.json(ApiResponse.success('Student details retrieved successfully', student));
});

// Get Academic Updates
exports.getAcademicUpdates = catchAsync(async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    const assignments = await Assignment.find({
        class: student.class,
        dueDate: { $gte: new Date() }
    }).limit(5);

    const exams = await Exam.find({
        class: student.class,
        date: { $gte: new Date() }
    }).limit(5);

    res.json(ApiResponse.success('Academic updates retrieved successfully', {
        assignments,
        exams
    }));
});

// Get Parent Profile
exports.getParentProfile = catchAsync(async (req, res) => {
    const parent = await Parent.findById(req.user.parentId)
        .select('-password');

    if (!parent) {
        return res.status(404).json(ApiResponse.error('Parent not found'));
    }

    res.json(ApiResponse.success('Parent profile retrieved successfully', parent));
});

// Update Parent Profile
exports.updateParentProfile = catchAsync(async (req, res) => {
    const parent = await Parent.findByIdAndUpdate(
        req.user.parentId,
        {
            $set: {
                name: req.body.name,
                email: req.body.email,
                contact: req.body.contact,
                address: req.body.address
            }
        },
        { new: true, runValidators: true }
    );

    res.json(ApiResponse.success('Profile updated successfully', parent));
});

// Update Notification Settings
exports.updateNotificationSettings = catchAsync(async (req, res) => {
    const parent = await Parent.findByIdAndUpdate(
        req.user.parentId,
        {
            $set: {
                'preferences.notifications': req.body.notifications
            }
        },
        { new: true }
    );

    res.json(ApiResponse.success('Notification settings updated successfully', parent.preferences.notifications));
});

module.exports = exports;