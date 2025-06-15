const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const progressController = require('../controller/studentProgressController');

// Debug middleware
router.use((req, res, next) => {
    console.log('Progress Route:', {
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query
    });
    next();
});

router.use(authenticate);
router.use(checkRole(['parent']));

router.get('/:studentId', progressController.getStudentProgress);
router.get('/:studentId/exams', progressController.getExamResults);
router.get('/:studentId/report-card/:examId', progressController.getReportCard);

module.exports = router;