const express = require('express');
const router = express.Router();

// Temporary routes for testing
router.get('/', (req, res) => {
    res.json({ message: 'Parent route working' });
});

router.get('/test', (req, res) => {
    res.json({ message: 'Parent test route' });
});

module.exports = router;
