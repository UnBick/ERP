const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const parentController = require('../controller/parentController');
const progressController = require('../controller/studentProgressController');
const attendanceRoutes = require('./attendanceRoute');
const gradesRoutes = require('./gradesRoute');
const gradesController = require('../controller/gradesController');
const settingsRoutes = require('./settingsRoute');

// Apply middleware first
router.use(authMiddleware);
router.use(checkRole('parent')); // Fix: Pass string instead of array

// Debug middleware
router.use((req, res, next) => {
    console.log('Parent Route:', {
        path: req.path,
        method: req.method,
        userId: req.user?._id,
        role: req.user?.role
    });
    next();
});

// Parent routes - ensure order is correct
router.get('/dashboard', parentController.getDashboard);
router.get('/children', parentController.getChildren);
router.get('/student-progress/:studentId', progressController.getStudentProgress);
router.use('/attendance', attendanceRoutes);
router.use('/grades', gradesRoutes);

// Add grades routes directly instead of using separate router
router.get('/grades/:studentId', gradesController.getStudentGrades);
router.get('/grades/:studentId/report/:examId', gradesController.getGradeReport);

// Add settings routes
router.use('/settings', settingsRoutes);

module.exports = router;
