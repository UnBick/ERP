const express = require('express');
const router = express.Router();
const gradesController = require('../controller/gradesController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(checkRole(['parent']));

router.get('/:studentId', gradesController.getStudentGrades);
router.get('/:studentId/report/:examId', gradesController.getGradeReport);

module.exports = router;
