const express = require('express');
const router = express.Router();
const { 
    getTimetable,
    exportTimetable,
    updateNotificationPreferences,
    getNotificationPreferences
} = require('../controllers/timetableController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateStudent } = require('../../../middleware/roleMiddleware');
const cache = require('../../../middleware/cacheMiddleware');

/**
 * @route   GET /api/student/timetable
 * @desc    Get student's class timetable
 * @access  Private (Student)
 */
router.get(
    '/', 
    [
        authMiddleware, 
        validateStudent,
        cache('1 hour')
    ], 
    getTimetable
);

/**
 * @route   GET /api/student/timetable/export
 * @desc    Export timetable in PDF or Excel format
 * @access  Private (Student)
 */
router.get(
    '/export',
    [
        authMiddleware,
        validateStudent,
        // Validate export format
        (req, res, next) => {
            const { format } = req.query;
            if (!['pdf', 'excel'].includes(format)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid export format. Use pdf or excel.'
                });
            }
            next();
        }
    ],
    exportTimetable
);

/**
 * @route   GET /api/student/timetable/notifications
 * @desc    Get notification preferences for timetable
 * @access  Private (Student)
 */
router.get(
    '/notifications',
    [authMiddleware, validateStudent],
    getNotificationPreferences
);

/**
 * @route   PUT /api/student/timetable/notifications
 * @desc    Update notification preferences for timetable
 * @access  Private (Student)
 */
router.put(
    '/notifications',
    [authMiddleware, validateStudent],
    updateNotificationPreferences
);

module.exports = router;