const mongoose = require('mongoose');
const Student = require('../../student/models/studentModel');
const Teacher = require('../../teacher/models/teacherModel'); // Changed from staffModel
const Class = require('../../academic/models/classModel');
const Attendance = require('../../academic/models/attendanceModel');

const dashboardController = {
    getDashboardData: async (req, res) => {
        try {
            console.log('Fetching dashboard data...');
            const { range = 'week' } = req.query;

            // Verify database connection
            if (mongoose.connection.readyState !== 1) {
                throw new Error('Database connection is not ready');
            }

            // Debug: Log collection names
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Available collections:', collections.map(c => c.name));

            // Debug: Log Teacher model
            console.log('Teacher model:', {
                modelName: Teacher.modelName,
                collection: Teacher.collection.name
            });

            // Try to find one teacher to verify collection access
            const sampleTeacher = await Teacher.findOne();
            console.log('Sample teacher:', sampleTeacher ? 'Found' : 'Not found');

            const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
                Student.countDocuments().then(count => {
                    console.log('Student count:', count);
                    return count;
                }),
                Teacher.countDocuments().then(count => {
                    console.log('Teacher count:', count);
                    return count;
                }),
                Class.countDocuments().then(count => {
                    console.log('Class count:', count);
                    return count;
                })
            ]);

            // Create response data
            const data = {
                totalStudents,
                totalTeachers,
                totalClasses,
                attendance: 95,
                feeCollection: 150000,
                attendanceTrends: Array.from({ length: 7 }, (_, i) => ({
                    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    students: Math.floor(Math.random() * 20) + 80,
                    teachers: Math.floor(Math.random() * 10) + 90
                })).reverse()
            };

            console.log('Final dashboard data:', data);

            res.json({
                success: true,
                data
            });

        } catch (error) {
            console.error('Dashboard Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard data',
                error: {
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                }
            });
        }
    }
};

module.exports = dashboardController;
