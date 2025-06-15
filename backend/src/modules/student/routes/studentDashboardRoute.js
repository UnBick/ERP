const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controller/studentDashboardController');

// Debug middleware
router.use((req, res, next) => {
    console.log('Processing dashboard request:', {
        url: req.originalUrl,
        method: req.method,
        userId: req.user?._id
    });
    next();
});

// Handle both /dashboard and /dashboard/ endpoints
router.get(['/', ''], getDashboardData);

module.exports = router;