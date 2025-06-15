const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Parent = require('../models/parentModel');
const Student = require('../../student/models/studentModel');
const Teacher = require('../../teacher/models/teacherModel');
const Message = require('../../communication/models/Message');

exports.getTeachers = catchAsync(async (req, res) => {
    // Find parent and their children
    const parent = await Parent.findOne({ user: req.user._id })
        .populate({
            path: 'children',
            populate: {
                path: 'academicInfo.class academicInfo.section',
                select: 'name'
            }
        });

    if (!parent || !parent.children.length) {
        return res.status(404).json(
            ApiResponse.error('No children found for this parent')
        );
    }

    // Get all sections of parent's children
    const sectionIds = parent.children.map(child => child.academicInfo.section._id);

    // Find all teachers teaching these sections
    const teachers = await Teacher.aggregate([
        {
            $match: {
                $or: [
                    { classTeacherFor: { $in: sectionIds } },
                    { 'teachingAssignments.section': { $in: sectionIds } }
                ]
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        {
            $unwind: '$userDetails'
        },
        {
            $project: {
                _id: '$userDetails._id',
                name: 1,
                email: '$userDetails.email',
                staffId: '$staffID',
                department: 1
            }
        }
    ]);

    const formattedTeachers = teachers.map(teacher => ({
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        detail: `${teacher.department} Teacher`,
        type: 'teacher'
    }));

    res.json(ApiResponse.success('Teachers retrieved successfully', formattedTeachers));
});

exports.getMessages = catchAsync(async (req, res) => {
    const { teacherId } = req.params;

    const messages = await Message.find({
        $or: [
            { sender: req.user._id, recipient: teacherId },
            { sender: teacherId, recipient: req.user._id }
        ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name')
    .populate('recipient', 'name');

    res.json(ApiResponse.success('Messages retrieved successfully', messages));
});

exports.sendMessage = catchAsync(async (req, res) => {
    const { recipientId, content, type = 'direct' } = req.body;

    // Create the message
    const message = await Message.create({
        sender: req.user._id,
        recipient: recipientId,
        content,
        type,
        status: 'sent',
        attachments: req.files ? req.files.map(file => file.path) : []
    });

    // Populate sender and recipient details for response
    await message.populate('sender', 'name');
    await message.populate('recipient', 'name');

    res.status(201).json(
        ApiResponse.success('Message sent successfully', message)
    );
});

// Optional: Add method to mark messages as read
exports.markAsRead = catchAsync(async (req, res) => {
    const { messageId } = req.params;

    const message = await Message.findOneAndUpdate(
        {
            _id: messageId,
            recipient: req.user._id
        },
        {
            $set: { readAt: new Date() }
        },
        { new: true }
    );

    if (!message) {
        return res.status(404).json(
            ApiResponse.error('Message not found')
        );
    }

    res.json(ApiResponse.success('Message marked as read', message));
});