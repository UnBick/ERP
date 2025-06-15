const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Test route to verify router functionality
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route working' });
});

// Login route
router.post('/login', authController.login);

router.post('/register', (req, res) => {
    res.json({ message: 'Register endpoint' });
});

router.post('/logout', authMiddleware, authController.logout);

// Export the router directly
module.exports = router;