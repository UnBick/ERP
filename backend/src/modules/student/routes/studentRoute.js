const express = require('express');
const router = express.Router();

// Temporary routes for testing
router.get('/', (req, res) => {
    res.json({ message: 'Students route working' });
});

router.get('/test', (req, res) => {
    res.json({ message: 'Student test route' });
});

module.exports = router;