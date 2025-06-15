const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const upload = require('../../../middleware/uploadMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('Parent Settings Route:', {
        path: req.path,
        method: req.method,
        userId: req.user?._id
    });
    next();
});

// Apply middleware
router.use(authMiddleware);
router.use(checkRole(['parent']));

// Profile routes
router.route('/profile')
    .get(settingsController.getProfile)
    .put(settingsController.updateProfile);

router.post('/profile/avatar', upload.single('avatar'), settingsController.updateAvatar);

// Security routes
router.post('/security/password', settingsController.updatePassword);

// Notification routes
router.get('/notifications', settingsController.getNotificationSettings);
router.put('/notifications', settingsController.updateNotificationSettings);

// General settings routes
router.get('/general', settingsController.getGeneralSettings);
router.put('/general', settingsController.updateGeneralSettings);

module.exports = router;