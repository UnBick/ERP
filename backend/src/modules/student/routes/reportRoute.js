const express = require('express');
const router = express.Router();
const {
    getReports,
    generateReportCards,
    downloadReport,
    shareReport,
    approveGrades
} = require('../controllers/reportController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateAdmin, validateTeacher } = require('../../../middleware/roleMiddleware');

// Get reports with filters
router.get(
    '/',
    [authMiddleware],
    getReports
);

// Generate report cards
router.post(
    '/generate',
    [authMiddleware, validateTeacher],
    generateReportCards
);

// Download report in specific format
router.get(
    '/download/:reportId/:format',
    [authMiddleware],
    downloadReport
);

// Share report
router.post(
    '/:reportId/share',
    [authMiddleware, validateTeacher],
    shareReport
);

// Approve grades
router.post(
    '/:reportId/approve',
    [authMiddleware, validateAdmin],
    approveGrades
);

module.exports = router;