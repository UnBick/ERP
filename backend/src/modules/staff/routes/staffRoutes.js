const express = require('express');
const router = express.Router();
const staffController = require('../controller/staffController');
const authMiddleware = require('../../../middleware/authMiddleware');
const multer = require('multer');
const mongoose = require('mongoose');

// Debug middleware to log requests
router.use((req, res, next) => {
  console.log('[StaffRoutes] Request:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

// Add debug route at the top
router.get('/debug/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[StaffRoutes] Debug lookup for ID:', id);
        
        const staff = await Staff.findById(id);
        res.json({
            exists: !!staff,
            data: staff,
            idType: typeof id,
            validObjectId: require('mongoose').Types.ObjectId.isValid(id)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Param middleware to validate ObjectId
router.param('reportId', (req, res, next, reportId) => {
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid report ID format'
        });
    }
    next();
});

// Basic CRUD routes
router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
router.get('/:id', staffController.getStaffById);

// Public routes (if any)

// Transport routes - Move to top to prevent conflicts
router.get('/transport/routes', (req, res, next) => {
  console.log('Transport routes endpoint accessed');
  staffController.getTransportRoutes(req, res, next);
});
router.get('/transport/routes/:routeId/stops', staffController.getRouteStops);
router.get('/transport/routes/:routeId/location', staffController.getBusLocation);
router.post('/transport/routes/:routeId/track', staffController.updateBusLocation);

// Reports routes - Move to top to prevent conflict with :id routes
router.get('/generate-report', staffController.generateReport);  // Changed from /reports
router.get('/reports/:reportId/download', staffController.downloadReport); // Changed to use reportId
router.post('/reports/:reportId/share', staffController.shareReport); // Changed to use reportId

// Protected routes
router.get('/departments', staffController.getDepartments); // Remove authMiddleware since it's already applied at the router level
router.get('/dashboard-stats', staffController.getDashboardStats);
router.get('/department/:department', staffController.getStaffByDepartment);

// Staff attendance routes
router.get('/attendance/statistics', staffController.getAttendanceStatistics);
router.post('/attendance/mark', staffController.markAttendance);
router.post('/attendance/bulk-upload', staffController.bulkUploadAttendance);
router.get('/attendance/report', authMiddleware, staffController.getAttendanceReport);

// Add biometric scan route
router.get('/attendance/biometric-scan', staffController.handleBiometricScan);

// Leave management routes
router.get('/leave-requests', staffController.getLeaveRequests);
router.get('/leave-balance', staffController.getLeaveBalance);
router.post('/leave/apply', multer().array('documents'), staffController.applyLeave);
router.put('/leave/:id/process', staffController.processLeave);
router.get('/leave/history', staffController.getLeaveHistory); // New route for leave history

module.exports = router;
