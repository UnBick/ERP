const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

const Class = require('../models/classModel');
const excel = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const classesController = {
    getAllClasses: async (req, res) => {
        try {
            console.log('Getting all classes...');
            
            const classes = await Class.find()
                .select('-__v')
                .lean();

            console.log(`Found ${classes.length} classes:`, classes);

            // Transform the data to match frontend expectations
            const transformedClasses = classes.map(cls => ({
                id: cls._id,
                name: cls.name,
                level: cls.level,
                capacity: cls.capacity,
                academicYear: cls.academicYear,
                currentStudents: cls.currentStudents || 0,
                isActive: cls.isActive
            }));

            res.status(200).json({
                success: true,
                data: transformedClasses
            });

        } catch (error) {
            console.error('Error in getAllClasses:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching classes',
                error: error.message
            });
        }
    },

    createClass: async (req, res) => {
        try {
            const newClass = await Class.create({
                ...req.body,
                createdBy: req.user._id
            });

            res.status(201).json({
                status: 'success',
                data: newClass
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    status: 'error',
                    message: 'A class with this name already exists for the specified academic year'
                });
            }
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    },

    updateClass: async (req, res) => {
        try {
            const updatedClass = await Class.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!updatedClass) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Class not found'
                });
            }

            res.status(200).json({
                status: 'success',
                data: updatedClass
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    },

    deleteClass: async (req, res) => {
        try {
            const classId = req.params.id;
            
            if (!classId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Class ID is required'
                });
            }

            const classToDelete = await Class.findById(classId);

            if (!classToDelete) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Class not found'
                });
            }

            // Check if class has students
            if (classToDelete.currentStudents > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cannot delete class with enrolled students'
                });
            }

            await Class.findByIdAndDelete(classId);

            res.status(200).json({
                status: 'success',
                message: 'Class deleted successfully'
            });
        } catch (error) {
            console.error('Delete class error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error while deleting class',
                error: error.message
            });
        }
    },

    exportData: async (req, res) => {
        try {
            const { format } = req.query;
            const classes = await Class.find().sort({ name: 1 });

            if (format === 'xlsx') {
                const workbook = new excel.Workbook();
                const worksheet = workbook.addWorksheet('Classes');

                worksheet.columns = [
                    { header: 'Name', key: 'name', width: 20 },
                    { header: 'Level', key: 'level', width: 15 },
                    { header: 'Academic Year', key: 'academicYear', width: 15 },
                    { header: 'Capacity', key: 'capacity', width: 10 },
                    { header: 'Current Students', key: 'currentStudents', width: 15 },
                    { header: 'Status', key: 'status', width: 10 }
                ];

                classes.forEach(classItem => {
                    worksheet.addRow({
                        name: classItem.name,
                        level: classItem.level,
                        academicYear: classItem.academicYear,
                        capacity: classItem.capacity,
                        currentStudents: classItem.currentStudents,
                        status: classItem.isActive ? 'Active' : 'Inactive'
                    });
                });

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=classes.xlsx');

                await workbook.xlsx.write(res);
                return res.status(200).end();
            }

            if (format === 'pdf') {
                const doc = new PDFDocument();
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=classes.pdf');
                doc.pipe(res);

                // Add PDF content
                doc.fontSize(16).text('Classes Report', { align: 'center' });
                doc.moveDown();

                classes.forEach(classItem => {
                    doc.fontSize(12).text(`Class: ${classItem.name}`);
                    doc.fontSize(10).text(`Level: ${classItem.level}`);
                    doc.fontSize(10).text(`Academic Year: ${classItem.academicYear}`);
                    doc.fontSize(10).text(`Capacity: ${classItem.capacity}`);
                    doc.fontSize(10).text(`Current Students: ${classItem.currentStudents}`);
                    doc.fontSize(10).text(`Status: ${classItem.isActive ? 'Active' : 'Inactive'}`);
                    doc.moveDown();
                });

                doc.end();
                return;
            }

            res.status(400).json({
                status: 'error',
                message: 'Invalid export format'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
};

module.exports = classesController;
