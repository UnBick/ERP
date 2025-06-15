const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const reportsValidation = require('../validations/reportsValidation.js');
const reportsController = require('../controller/reportsController');

router.use(authenticate);

// Student Reports Routes
router.get('/student', 
    checkRole(['admin', 'teacher']), 
    validate(reportsValidation.getReports),
    reportsController.getStudentReports
);

router.post('/student/generate',
    checkRole(['admin', 'teacher']),
    validate(reportsValidation.generateStudentReport),
    reportsController.generateStudentReport
);

// Exam Reports Routes
router.get('/exam', 
    checkRole(['admin', 'teacher']), 
    validate(reportsValidation.getReports),
    reportsController.getExamReports
);

router.post('/exam/generate',
    checkRole(['admin', 'teacher']),
    validate(reportsValidation.generateExamReport),
    reportsController.generateExamReport
);

// Attendance Reports Routes
router.get('/attendance', 
    checkRole(['admin', 'teacher']), 
    validate(reportsValidation.getReports),
    reportsController.getAttendanceReports
);

router.post('/attendance/generate',
    checkRole(['admin', 'teacher']),
    validate(reportsValidation.generateAttendanceReport),
    reportsController.generateAttendanceReport
);

// Finance Reports Routes
router.get('/finance', 
    checkRole(['admin']), 
    validate(reportsValidation.getFinanceReports),
    reportsController.getFinanceReports
);

router.post('/finance/generate',
    checkRole(['admin']),
    validate(reportsValidation.generateFinanceReport),
    reportsController.generateFinanceReport
);

// Payroll Reports Routes
router.get('/payroll', 
    checkRole(['admin']), 
    validate(reportsValidation.getPayrollReports),
    reportsController.getPayrollReports
);

router.post('/payroll/generate',
    checkRole(['admin']),
    validate(reportsValidation.generatePayrollReport),
    reportsController.generatePayrollReport
);

// Common Report Operations
router.get('/download/:id',
    checkRole(['admin', 'teacher']),
    validate(reportsValidation.downloadReport),
    reportsController.downloadReport
);

router.get('/preview/:id',
    checkRole(['admin', 'teacher']),
    validate(reportsValidation.previewReport),
    reportsController.previewReport
);

// Report Management Routes
router.get('/history',
    checkRole(['admin']),
    reportsController.getReportHistory
);

router.delete('/:id',
    checkRole(['admin']),
    validate(reportsValidation.deleteReport),
    reportsController.deleteReport
);

router.patch('/:id/archive',
    checkRole(['admin']),
    validate(reportsValidation.archiveReport),
    reportsController.archiveReport
);

router.post('/:id/share',
    checkRole(['admin', 'teacher']),
    validate(reportsValidation.shareReport),
    reportsController.shareReport
);

module.exports = router;