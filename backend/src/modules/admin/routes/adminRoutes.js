const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');

// Apply authentication middleware
router.use(authMiddleware);

// Add this route before other document routes
router.get('/documents/class-data', documentController.getClassesAndSections);

// Other document routes
router.post('/documents/generate', documentController.generateDocument);
router.get('/documents/templates', documentController.getDocumentTemplates);
router.post('/documents/templates', documentController.createDocumentTemplate);
router.put('/documents/templates/:id', documentController.updateDocumentTemplate);
router.delete('/documents/templates/:id', documentController.deleteDocumentTemplate);

// Add document generation route
router.post('/documents/generate', documentController.generateDocument);

router.post('/documents/generate', documentController.generateDocument);

module.exports = router;