const express = require('express');
const router = express.Router();
const examController = require('../controller/examController');

// Debug middleware
router.use((req, res, next) => {
    console.log('Exam route accessed:', req.method, req.originalUrl);
    next();
});

// Base routes
router.get('/', examController.getAllExams);
router.post('/', examController.createExam);
router.put('/:id', examController.updateExam);
router.delete('/:id', examController.deleteExam);
router.post('/bulk', examController.bulkCreateExams);

// Export router
module.exports = router;
