const express = require('express');
const router = express.Router();
const { getTeachers } = require('../controller/communicationController');
const authMiddleware = require('../../../middleware/authMiddleware');
const checkRole = require('../../../middleware/roleMiddleware').checkRole;
const dashboardRoutes = require('./studentDashboardRoute');
const attendanceRoutes = require('./attendanceRoute');
const settingsRoutes = require('./settingsRoute');

// Debug middleware
router.use((req, res, next) => {
    console.log('Student Route:', {
        fullUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        path: req.path,
        userId: req.user?._id
    });
    next();
});

// Apply auth middleware at the top level
router.use(authMiddleware);

// Mount dashboard route directly
router.use('/dashboard', (req, res, next) => {
    console.log('Accessing dashboard route');
    next();
}, dashboardRoutes);

// Mount attendance routes
router.use('/attendance', (req, res, next) => {
    console.log('Accessing attendance route');
    next();
}, attendanceRoutes);

// Mount settings routes
router.use('/settings', (req, res, next) => {
    console.log('Accessing settings route');
    next();
}, settingsRoutes);

// Teacher routes
router.get('/teachers', authMiddleware, checkRole(['student']), getTeachers);

module.exports = router;
