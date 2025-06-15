const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const timetableController = require('../controller/timetableController');

router.use(authenticate);
router.use(checkRole(['parent']));

router.get('/:studentId', timetableController.getStudentTimetable);
router.get('/:studentId/weekly', timetableController.getWeeklyTimetable);
router.get('/:studentId/today', timetableController.getTodayTimetable);
router.get('/:studentId/subjects', timetableController.getSubjectSchedule);

module.exports = router;