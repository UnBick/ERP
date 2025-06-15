const express = require('express');
const router = express.Router();
const { 
    getProfile,
    updateProfile,
    updateAvatar,
    updatePassword,
    getNotificationSettings,
    updateNotificationSettings,
    getGeneralSettings,
    updateGeneralSettings
} = require('../controller/settingsController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const upload = require('../../../middleware/uploadMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('Settings Route:', {
        path: req.path,
        method: req.method,
        userId: req.user?._id
    });
    next();
});

// Apply authentication middleware globally
router.use(authMiddleware, checkRole(['student']));

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/avatar', upload.single('avatar'), updateAvatar);

// Security routes
router.post('/security/password', updatePassword);

// Notification routes
router.get('/notifications', getNotificationSettings);
router.put('/notifications', updateNotificationSettings);

// General settings routes
router.get('/general', getGeneralSettings);
router.put('/general', updateGeneralSettings);

module.exports = router;