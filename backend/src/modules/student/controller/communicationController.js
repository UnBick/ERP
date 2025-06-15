const Student = require('../models/studentModel');
const Teacher = require('../../staff/models/staffModel');
const mongoose = require('mongoose');
const catchAsync = require('../../../utils/catchAsync');

exports.getTeachers = catchAsync(async (req, res) => {
    try {
        // Find the student and populate their section
        const student = await Student.findOne({ user: req.user._id })
            .populate('academicInfo.section')
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student record not found'
            });
        }

        // Get section ID from student record
        const sectionId = student.academicInfo.section._id;

        // Find teachers who teach this section or are class teachers
        const teachers = await Teacher.aggregate([
            {
                $match: {
                    $or: [
                        { classTeacherFor: new mongoose.Types.ObjectId(sectionId) },
                        { 'teachingAssignments.section': new mongoose.Types.ObjectId(sectionId) }
                    ],
                    isActive: true
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
                    staffId: '$staffID'
                }
            }
        ]);

        const formattedTeachers = teachers.map(teacher => ({
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            detail: `Staff ID: ${teacher.staffId}`,
            type: 'teacher'
        }));

        return res.json({
            success: true,
            message: 'Teachers fetched successfully',
            data: formattedTeachers
        });

    } catch (error) {
        console.error('Error in getTeachers:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch teachers',
            error: error.message
        });
    }
});
