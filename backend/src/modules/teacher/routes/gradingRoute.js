const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const gradingValidation = require('../validations/teacherValidation');
const gradingController = require('../controller/gradingController');

// Debug middleware
router.use((req, res, next) => {
    console.log('Grading route:', {
        path: req.path,
        method: req.method,
        body: req.body
    });
    next();
});

// Routes
router.get('/exam-types', gradingController.getExamTypes);
router.get('/students', validate(gradingValidation.getStudentsForGrading), gradingController.getStudentsForGrading);
router.get('/teacher-role', gradingController.getTeacherRole);
router.get('/sections/:classId', gradingController.getSections);
router.post('/submit', validate(gradingValidation.submitGrades), gradingController.submitGrades);
router.post('/upload', validate(gradingValidation.uploadGrades), gradingController.uploadGrades);

module.exports = router;