const express = require('express');
const router = express.Router();
const attendanceController = require('../controller/attendanceController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('Attendance Route:', {
        path: req.path,
        method: req.method,
        userId: req.user?._id,
        params: req.params,
        query: req.query
    });
    next();
});

router.use(authMiddleware);
router.use(checkRole(['parent']));

router.get('/:studentId', attendanceController.getAttendance);
router.get('/:studentId/stats', attendanceController.getAttendanceStats);

module.exports = router;