const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const parentDashboardController = require('../controller/parentDashboardController');

// Debug middleware
router.use((req, res, next) => {
    console.log('Parent Route:', {
        url: req.originalUrl,
        method: req.method,
        userId: req.user?._id
    });
    next();
});

// Dashboard routes - simplified for initial setup
router.get('/dashboard', authMiddleware, parentDashboardController.getDashboardOverview);

// Other routes - uncomment and implement as needed
/*
router.get('/children', authMiddleware, parentDashboardController.getChildrenSummary);
router.get('/children/:studentId', authMiddleware, parentDashboardController.getChildDetails);
*/

module.exports = router;