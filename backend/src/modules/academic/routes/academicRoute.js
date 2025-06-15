const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../middleware/validation/validationUtils');

// Import controllers
const classesController = require('../controller/classesController');
const sectionController = require('../controller/sectionController');
const subjectController = require('../controller/subjectController');
const syllabusController = require('../controller/syllabusController');
const timetableController = require('../controller/timetableController');

// Apply middleware
router.use(authenticate);
router.use(checkRole(['admin', 'teacher']));

// Classes Routes
router.get('/classes', classesController.getAllClasses);
router.post('/classes', validate('createClass'), classesController.createClass);
router.put('/classes/:id', validate('updateClass'), classesController.updateClass);
router.delete('/classes/:id', classesController.deleteClass);
router.get('/classes/export', classesController.exportData);

// Sections Routes
router.get('/sections', sectionController.getAllSections);
router.get('/sections/class/:classId', sectionController.getSectionsByClass);
router.post('/sections', validate('createSection'), sectionController.createSection);
router.put('/sections/:id', validate('updateSection'), sectionController.updateSection);
router.delete('/sections/:id', sectionController.deleteSection);

// Subjects Routes
router.get('/subjects', subjectController.getAllSubjects);
router.post('/subjects', validate('createSubject'), subjectController.createSubject);
router.put('/subjects/:id', validate('updateSubject'), subjectController.updateSubject);
router.delete('/subjects/:id', subjectController.deleteSubject);

// Syllabus Routes
router.get('/syllabus', syllabusController.getAllSyllabus);
router.post('/syllabus', validate('createSyllabus'), syllabusController.createSyllabus);
router.put('/syllabus/:id', validate('updateSyllabus'), syllabusController.updateSyllabus);
router.delete('/syllabus/:id', syllabusController.deleteSyllabus);

// Timetable Routes
router.get('/timetable', timetableController.getAllTimetables);
router.get('/timetable/:className/:sectionName', timetableController.getTimetableByClassAndSection);
router.post('/timetable/bulk', timetableController.bulkCreateTimetable);
router.delete('/timetable/:className/:sectionName', timetableController.deleteTimetableByClassAndSection);
router.get('/timetable/teachers-by-subject/:subject', timetableController.getTeachersBySubject);
router.get('/timetable/validate', timetableController.validateTimetable);
router.get('/timetable/export', timetableController.exportTimetable);

module.exports = router;