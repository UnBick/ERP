const express = require('express');
const router = express.Router();
const sectionController = require('../controller/sectionController');
const { authMiddleware } = require('../../../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('[SectionRoutes] Request:', {
        method: req.method,
        path: req.path,
        body: req.body
    });
    next();
});

// Updated route paths
router.get('/', sectionController.getAllSections);
router.get('/class/:classId', sectionController.getSectionsByClass);
router.post('/', sectionController.createSection);
router.put('/:id', sectionController.updateSection);
router.delete('/:id', sectionController.deleteSection);
router.patch('/:id/capacity', sectionController.updateSectionCapacity);

module.exports = router;
