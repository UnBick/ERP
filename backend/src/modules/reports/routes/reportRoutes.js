const express = require('express');
const router = express.Router();
const reportsController = require('../controller/reportsController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('[ReportRoutes] Request:', {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: req.headers
    });
    next();
});

// Finance report routes
router.get('/finance', reportsController.getFinanceReports);
router.get('/finance/export', reportsController.exportFinanceReport);

// Other report routes
router.get('/student', reportsController.getStudentReports);
router.get('/exam', reportsController.getExamReports);
router.get('/attendance', reportsController.getAttendanceReports);

// Add payroll routes with debug logging
router.get('/payroll', (req, res, next) => {
    console.log('[PayrollReports] Request:', {
        method: req.method,
        query: req.query,
        headers: req.headers
    });
    next();
}, reportsController.getPayrollReports);

module.exports = router;
