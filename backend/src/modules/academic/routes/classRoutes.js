const express = require('express');
const router = express.Router();
const classesController = require('../controller/classesController');
const auth = require('../../../middleware/auth');

// Debug middleware
router.use((req, res, next) => {
    console.log('[ClassRoutes] Request:', {
        method: req.method,
        path: req.path,
        query: req.query
    });
    next();
});

// Class routes
router.get('/', auth, classesController.getAllClasses);
router.post('/', auth, classesController.createClass);
router.put('/:id', auth, classesController.updateClass);
router.delete('/:id', auth, classesController.deleteClass);
router.get('/export', auth, classesController.exportData);

module.exports = router;
