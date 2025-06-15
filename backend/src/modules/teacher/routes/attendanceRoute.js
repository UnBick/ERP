const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const attendanceValidation = require('../validations/teacherValidation');
const attendanceController = require('../controller/attendanceController');

// Debug middleware to log requests
router.use((req, res, next) => {
    console.log('Attendance Route:', {
        path: req.path,
        method: req.method,
        body: req.body
    });
    next();
});

// No need for router.use(authenticate) since we're using authMiddleware in app.js

// Self Attendance Routes with fixed paths
router.post('/self/mark', 
    authMiddleware,
    async (req, res, next) => {
        console.log('Mark attendance request:', req.body);
        next();
    },
    attendanceController.markSelfAttendance
);
router.get('/self/history', attendanceController.getAttendanceHistory);
router.get('/self/stats', attendanceController.getAttendanceStats);

// Student Attendance Routes
router.post('/student', attendanceController.markStudentAttendance); // Changed from '/student/mark'
router.get('/students', attendanceController.getStudents);
router.get('/teacher-role', attendanceController.checkTeacherRole);

// Leave Management Routes
router.post('/leave/request', 
    authMiddleware,
    async (req, res, next) => {
        console.log('Leave request:', req.body);
        next();
    },
    attendanceController.requestLeave
);

module.exports = router;