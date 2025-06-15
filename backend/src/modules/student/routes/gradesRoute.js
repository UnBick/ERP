const express = require('express');
const router = express.Router();
const { 
    getGrades,
    getPublishedGrades,
    getGradeReport,
    getGradeStatistics
} = require('../controllers/gradesController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateStudent } = require('../../../middleware/roleMiddleware');

// Get all grades with filters
router.get('/', 
    [authMiddleware, validateStudent], 
    getGrades
);

// Get published grades
router.get('/published', 
    [authMiddleware, validateStudent], 
    getPublishedGrades
);

// Get grade report in PDF format
router.get('/report/:examId', 
    [authMiddleware, validateStudent], 
    getGradeReport
);

// Get grade statistics
router.get('/statistics', 
    [authMiddleware, validateStudent], 
    getGradeStatistics
);

module.exports = router;