const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Syllabus = require('../models/syllabusModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');

const syllabusController = {
    getSyllabus: async (req, res) => {
        try {
            const syllabus = await Syllabus.find()
                .populate('classId', 'name')
                .populate('subjectId', 'name')
                .sort({ 'classId.name': 1, 'subjectId.name': 1 });

            const formattedSyllabus = syllabus.map(s => ({
                id: s._id,
                title: s.title,
                description: s.description,
                classId: s.classId._id,
                className: s.classId.name,
                subjectId: s.subjectId._id,
                subjectName: s.subjectId.name,
                academicYear: s.academicYear,
                content: s.content,
                attachments: s.attachments,
                isActive: s.isActive,
                createdAt: s.createdAt
            }));

            res.status(200).json({
                status: 'success',
                data: formattedSyllabus
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    createSyllabus: async (req, res) => {
        try {
            const { classId, subjectId } = req.body;

            // Validate class and subject exist
            const [classExists, subjectExists] = await Promise.all([
                Class.findById(classId),
                Subject.findById(subjectId)
            ]);

            if (!classExists || !subjectExists) {
                return res.status(404).json({
                    status: 'error',
                    message: !classExists ? 'Class not found' : 'Subject not found'
                });
            }

            const newSyllabus = await Syllabus.create({
                ...req.body,
                createdBy: req.user._id
            });

            res.status(201).json({
                status: 'success',
                data: newSyllabus
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    },

    updateSyllabus: async (req, res) => {
        try {
            const syllabusId = req.params.id;
            const updates = req.body;

            const updatedSyllabus = await Syllabus.findByIdAndUpdate(
                syllabusId,
                updates,
                { new: true, runValidators: true }
            );

            if (!updatedSyllabus) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Syllabus not found'
                });
            }

            res.status(200).json({
                status: 'success',
                data: updatedSyllabus
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    },

    deleteSyllabus: async (req, res) => {
        try {
            const syllabusId = req.params.id;
            const syllabus = await Syllabus.findByIdAndDelete(syllabusId);

            if (!syllabus) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Syllabus not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Syllabus deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    },

    getAttachments: async (req, res) => {
        try {
            const syllabusId = req.params.id;
            const syllabus = await Syllabus.findById(syllabusId).select('attachments');

            if (!syllabus) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Syllabus not found'
                });
            }

            res.status(200).json({
                status: 'success',
                data: syllabus.attachments
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

module.exports = syllabusController;
