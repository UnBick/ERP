const express = require('express');
const router = express.Router();
const teacherDashboardController = require('../controller/teacherDashboardController');
const profileController = require('../controller/profileController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Protect all teacher routes
router.use(authMiddleware);

// Profile routes
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.post('/profile/photo', upload.single('photo'), profileController.uploadProfilePhoto);

// Dashboard route
router.get('/dashboard-data', teacherDashboardController.getDashboardData);

// Teachers by subject route - fix the route path to match frontend
router.get('/teachers-by-subject', authMiddleware, teacherDashboardController.getTeachersBySubject);

// Apply role middleware for other routes
router.use(checkRole(['teacher']));

module.exports = router;
