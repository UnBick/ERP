const Class = require('../models/classModel');
const Section = require('../models/sectionModel');
const Subject = require('../models/subjectModel');

const academicController = {
    getDashboardStats: async (req, res) => {
        try {
            const stats = {
                totalClasses: await Class.countDocuments(),
                totalSections: await Section.countDocuments(),
                totalSubjects: await Subject.countDocuments()
            };
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getStats: async (req, res) => {
        try {
            const stats = await Class.aggregate([
                {
                    $lookup: {
                        from: 'sections',
                        localField: '_id',
                        foreignField: 'classId',
                        as: 'sections'
                    }
                },
                {
                    $project: {
                        className: 1,
                        sectionCount: { $size: '$sections' }
                    }
                }
            ]);
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    generateAcademicReport: async (req, res) => {
        try {
            const report = await Class.aggregate([
                {
                    $lookup: {
                        from: 'sections',
                        localField: '_id',
                        foreignField: 'classId',
                        as: 'sections'
                    }
                },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: '_id',
                        foreignField: 'classId',
                        as: 'subjects'
                    }
                }
            ]);
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = academicController;
