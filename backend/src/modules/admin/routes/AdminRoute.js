const express = require('express');
const router = express.Router();
const { 
    getDashboardStats, 
    getAnalytics,
    exportDashboardData
} = require('../controllers/dashboardController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateAdmin } = require('../../../middleware/roleMiddleware');
const cache = require('../../../middleware/cacheMiddleware');

/**
 * Dashboard Routes
 */
router.get(
    '/dashboard',
    [
        authMiddleware, 
        validateAdmin,
        cache('2 minutes')
    ],
    getDashboardStats
);

/**
 * Analytics Routes
 */
router.get(
    '/analytics',
    [authMiddleware, validateAdmin],
    getAnalytics
);

/**
 * Export Routes
 */
router.get(
    '/dashboard/export/:format',
    [authMiddleware, validateAdmin],
    exportDashboardData
);

/**
 * Statistics Routes
 */
// Student Stats
router.get(
    '/stats/students',
    [authMiddleware, validateAdmin],
    require('../../student/controllers/studentController').getStudentStats
);

// Teacher Stats
router.get(
    '/stats/teachers',
    [authMiddleware, validateAdmin],
    require('../../teacher/controllers/teacherController').getTeacherStats
);

// Fee Collection Stats
router.get(
    '/stats/fees',
    [authMiddleware, validateAdmin],
    require('../../finance/controllers/feeController').getFeeCollectionStats
);

// Attendance Stats
router.get(
    '/stats/attendance',
    [authMiddleware, validateAdmin],
    require('../../student/controllers/attendanceController').getAttendanceStats
);

/**
 * Chart Data Routes
 */
router.get(
    '/charts/attendance-trends',
    [authMiddleware, validateAdmin],
    require('../controllers/dashboardController').getAttendanceTrends
);

router.get(
    '/charts/fee-collection',
    [authMiddleware, validateAdmin],
    require('../controllers/dashboardController').getFeeCollectionTrends
);

router.get(
    '/charts/academic-performance',
    [authMiddleware, validateAdmin],
    require('../controllers/dashboardController').getAcademicPerformanceTrends
);

/**
 * Quick Actions Routes
 */
router.get(
    '/quick-stats',
    [authMiddleware, validateAdmin],
    require('../controllers/dashboardController').getQuickStats
);

module.exports = router;