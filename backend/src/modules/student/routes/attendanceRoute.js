const express = require('express');
const router = express.Router();
const { 
    getAttendance, 
    getAttendanceStats, 
    submitLeaveRequest,
    getLeaveRequests,
    cancelLeaveRequest 
} = require('../controller/attendanceController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');

// Apply auth middleware globally
router.use(authMiddleware, checkRole(['student']));

// Debug middleware
router.use((req, res, next) => {
    console.log('Attendance Route:', {
        path: req.path,
        method: req.method,
        userId: req.user?._id
    });
    next();
});

// Attendance routes
router.get('/', getAttendance);
router.get('/stats', getAttendanceStats);

// Leave request routes
router.post('/leave-request', submitLeaveRequest);
router.get('/leave-requests', getLeaveRequests);
router.put('/leave-request/:requestId/cancel', cancelLeaveRequest);

module.exports = router;