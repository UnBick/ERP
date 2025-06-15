const express = require('express');
const router = express.Router();
const { 
    getStudentsByClass,
    submitAttendance,
    getAttendance,
    getAttendanceStatistics,
    updateAttendance,
    getMonthlyReport
} = require('../controllers/attendanceController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateTeacher } = require('../../../middleware/roleMiddleware');

// Get students by class and section
router.get(
    '/students/:classId/:sectionId',
    [authMiddleware, validateTeacher],
    getStudentsByClass
);

// Submit attendance
router.post(
    '/submit',
    [authMiddleware, validateTeacher],
    submitAttendance
);

// Get attendance records
router.get(
    '/',
    authMiddleware,
    getAttendance
);

// Get attendance statistics
router.get(
    '/statistics',
    authMiddleware,
    getAttendanceStatistics
);

// Update attendance record
router.patch(
    '/:attendanceId',
    [authMiddleware, validateTeacher],
    updateAttendance
);

// Get monthly attendance report
router.get(
    '/report/monthly',
    authMiddleware,
    getMonthlyReport
);

module.exports = router;