const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const classScheduleValidation = require('../validations/teacherValidation');
const classScheduleController = require('../controller/classScheduleController');

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(checkRole(['teacher']));

// Get schedule routes
router.get('/schedule',
    validate(classScheduleValidation.getSchedule),
    classScheduleController.getSchedule
);

// Substitute request routes
router.post('/substitute/request',
    validate(classScheduleValidation.requestSubstitute),
    classScheduleController.requestSubstitute
);

// Schedule notes routes
router.post('/notes',
    validate(classScheduleValidation.addScheduleNote),
    classScheduleController.addScheduleNote
);

// Reminders routes
router.get('/reminders',
    classScheduleController.getReminders
);

module.exports = router;