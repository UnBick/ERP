const express = require('express');
const router = express.Router();
const examController = require('../controller/examController');
const gradeController = require('../controller/gradeController');
const marksController = require('../controller/marksController');

// Temporarily remove these until needed
// const { authenticate } = require('../../../middleware/authMiddleware');
// const { checkRole } = require('../../../middleware/roleMiddleware');
// const validate = require('../../../utils/validationUtil');

// Base routes for classes and subjects
router.get('/classes', examController.getClasses);
router.get('/subjects', examController.getSubjects);

// Add sections route
router.get('/classes/:classId/sections', examController.getSections);

// Add new route for getting students by section
router.get('/classes/:classId/sections/:sectionId/students', examController.getStudentsBySection);

// Add new route for getting subjects by class
router.get('/classes/:classId/subjects', examController.getSubjectsByClass);

// Create and get exam types
router.get('/examinations', examController.getExamTypes); // This will serve both /examinations and base route
router.get('/', examController.getExamTypes);
router.post('/', examController.createExamType);
router.put('/:id', examController.updateExamType);

// Add new route for getting exam by ID
router.get('/examinations/:id', examController.getExamById);

// Publish settings routes
router.post('/publish-settings', examController.createPublishSetting);
router.get('/publish-settings', examController.getPublishSettings);
router.put('/publish-settings/:id', examController.updatePublishSetting);

// Schedule routes - comment out until implemented
// router.get('/schedule', examController.getExamSchedules);
// router.post('/schedule', examController.createExamSchedule);
// router.put('/schedule/:id', examController.updateExamSchedule);
// router.delete('/schedule/:id', examController.deleteSchedule);

// Marks routes
router.get('/marks', marksController.getMarks);
router.post('/marks', marksController.submitMarks);
router.put('/marks', marksController.updateMarks);
router.post('/marks/publish/:examType/:class/:section', marksController.publishMarks);

// Administration routes
// Removed examinations endpoint from here

// Grade management routes
router.post('/exam-grades', gradeController.createGrade);
router.get('/exam-grades', gradeController.getGrades);
router.put('/exam-grades/:id', gradeController.updateGrade);
router.delete('/exam-grades/:id', gradeController.deleteGrade);

module.exports = router;