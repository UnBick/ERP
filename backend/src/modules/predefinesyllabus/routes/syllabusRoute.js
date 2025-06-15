const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const syllabusValidation = require('../validations/syllabusValidation');
const syllabusController = require('../controller/syllabusController');

router.use(authenticate);

// Public routes
router.get('/', syllabusController.getSyllabus);

// Protected routes
router.post(
    '/',
    checkRole(['admin', 'teacher']),
    validate(syllabusValidation.create),
    syllabusController.createSyllabus
);

router.put(
    '/:id',
    checkRole(['admin', 'teacher']),
    validate(syllabusValidation.update),
    syllabusController.updateSyllabus
);

router.post(
    '/:id/submit',
    checkRole(['admin', 'teacher']),
    syllabusController.submitForApproval
);

router.post(
    '/:id/approve',
    checkRole(['admin']),
    syllabusController.approveSyllabus
);

router.post(
    '/:id/publish',
    checkRole(['admin']),
    syllabusController.publishSyllabus
);

module.exports = router;