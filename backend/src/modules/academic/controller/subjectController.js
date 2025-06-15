const Subject = require('../models/subjectModel');
const ApiResponse = require('../../../utils/apiResponse');

const subjectController = {
    getAllSubjects: async (req, res) => {
        try {
            const subjects = await Subject.find()
                .select('-__v')
                .sort({ name: 1 });

            res.status(200).json({
                success: true,
                data: subjects
            });
        } catch (error) {
            console.error('Error in getAllSubjects:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching subjects',
                error: error.message
            });
        }
    },

    createSubject: async (req, res) => {
        try {
            const newSubject = await Subject.create(req.body);
            res.status(201).json({
                success: true,
                data: newSubject
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    updateSubject: async (req, res) => {
        try {
            const subject = await Subject.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: 'Subject not found'
                });
            }

            res.status(200).json({
                success: true,
                data: subject
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteSubject: async (req, res) => {
        try {
            const subject = await Subject.findById(req.params.id);

            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: 'Subject not found'
                });
            }

            await subject.remove();
            res.status(200).json({
                success: true,
                message: 'Subject deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = subjectController;
