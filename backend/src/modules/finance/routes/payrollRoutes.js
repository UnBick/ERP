const express = require('express');
const router = express.Router();
const payrollController = require('../controller/payrollController');

// Debug middleware
router.use((req, res, next) => {
    console.log('[PayrollRoute]', { method: req.method, path: req.path });
    next();
});

// Basic CRUD routes
router.get('/salaries', payrollController.getAllSalaries);
router.post('/salaries', payrollController.createSalary);
router.put('/salaries/:id', payrollController.updateSalary);
router.delete('/salaries/:id', payrollController.deleteSalary);

// Report routes
router.get('/reports', payrollController.getPayrollReports);
router.get('/reports/staff/:staffId', payrollController.getStaffPayrollReport);
router.get('/reports/download/:type', payrollController.downloadReport);
router.get('/reports/download/individual/:staffId', payrollController.downloadIndividualReport);

// Remove the undefined bulk download route for now
// router.post('/reports/download/bulk', payrollController.downloadBulkReport);

module.exports = router;
