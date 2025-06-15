const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const settingsValidation = require('../validations/teacherValidation');
const settingsController = require('../controller/settingsController');
const upload = require('../../../utils/fileUpload');

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(checkRole(['teacher']));

// Profile Management Routes
router.get('/profile',
    settingsController.getProfile
);

router.put('/profile',
    authenticate,
    upload.single('avatar'),
    async (req, res, next) => {
        console.log('Profile update request:', {
            file: req.file,
            body: req.body
        });
        next();
    },
    settingsController.updateProfile
);

// Password Management Routes
router.put('/password',
    authenticate,
    validate(settingsValidation.updatePassword),
    settingsController.updatePassword
);

router.get('/password/history',
    settingsController.getPasswordHistory
);

// Notification Settings Routes
router.get('/notifications',
    settingsController.getNotificationSettings
);

router.put('/notifications',
    validate(settingsValidation.updateNotificationSettings),
    settingsController.updateNotificationSettings
);

// General Settings Routes
router.get('/general',
    settingsController.getGeneralSettings
);

router.put('/general',
    validate(settingsValidation.updateGeneralSettings),
    settingsController.updateGeneralSettings
);

// Security Settings Routes
router.put('/security',
    validate(settingsValidation.updateSecuritySettings),
    settingsController.updateSecuritySettings
);

module.exports = router;