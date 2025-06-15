const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const aiValidation = require('../validations/aiValidation');
const validate = require('../../../middleware/validate');
const auth = require('../../../middleware/auth');

router.use(auth.protect); // Protect all AI routes

router.post(
  '/generate-questions',
  validate(aiValidation.generateQuestions),
  aiController.generateQuestions
);

router.get(
  '/content/:id',
  validate(aiValidation.getContent),
  aiController.getGeneratedContent
);

// Admin only routes
router.use(auth.restrictTo('admin', 'teacher'));

router.patch(
  '/content/:id/approve',
  validate(aiValidation.updateContentStatus),
  aiController.approveContent
);

router.patch(
  '/content/:id/reject',
  validate(aiValidation.updateContentStatus),
  aiController.rejectContent
);

module.exports = router;
