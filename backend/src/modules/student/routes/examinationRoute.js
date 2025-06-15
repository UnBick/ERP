const express = require('express');
const router = express.Router();
const { 
    getExaminations,
    scheduleExam,
    uploadResults,
    generateGradeCards,
    exportResults
} = require('../controllers/examinationController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateAdmin, validateTeacher } = require('../../../middleware/roleMiddleware');
const upload = require('../../../middleware/uploadMiddleware');

// Get examinations with filters
router.get('/',
    [authMiddleware],
    getExaminations
);

// Schedule new examination
router.post('/',
    [authMiddleware, validateTeacher],
    scheduleExam
);

// Upload examination results
router.post('/:examId/results',
    [authMiddleware, validateTeacher, upload.single('resultsFile')],
    uploadResults
);

// Generate grade cards in PDF
router.get('/grade-cards',
    [authMiddleware],
    generateGradeCards
);

// Export results to Excel
router.get('/:examId/results/export',
    [authMiddleware],
    exportResults
);

module.exports = router;