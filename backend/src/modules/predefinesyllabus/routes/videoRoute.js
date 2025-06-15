const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const videoValidation = require('../validations/videoValidation');
const videoController = require('../controllers/videoController');
const upload = require('../../../utils/fileUpload');

router.use(authenticate);

// Public routes
router.get('/', videoController.getVideos);
router.post('/:id/view', videoController.incrementViewCount);

// Protected routes
router.post(
    '/',
    checkRole(['admin', 'teacher']),
    upload.single('video'),
    validate(videoValidation.create),
    videoController.createVideo
);

router.put(
    '/:id',
    checkRole(['admin', 'teacher']),
    upload.single('video'),
    validate(videoValidation.update),
    videoController.updateVideo
);

router.delete(
    '/:id',
    checkRole(['admin']),
    videoController.deleteVideo
);

module.exports = router;