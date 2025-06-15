const express = require('express');
const router = express.Router();
const teacherDashboardController = require('../controller/teacherDashboardController');

// Debug middleware
router.use((req, res, next) => {
    console.log('[TeacherDashboard] Request:', {
        method: req.method,
        path: req.path,
        userId: req.user?._id
    });
    next();
});

// Base dashboard route
router.get('/dashboard-data', teacherDashboardController.getDashboardData);

// Other routes
router.get('/classes/today', teacherDashboardController.getTodayClasses);
router.get('/assignments/pending', teacherDashboardController.getPendingAssignments);
router.get('/notifications/recent', teacherDashboardController.getRecentNotifications);
router.get('/attendance/today', teacherDashboardController.getTodayAttendance);
router.get('/events/upcoming', teacherDashboardController.getUpcomingEvents);
router.get('/students/stats', teacherDashboardController.getStudentStats);

module.exports = router;