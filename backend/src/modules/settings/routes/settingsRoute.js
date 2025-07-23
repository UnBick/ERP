const express = require('express');
const router = express.Router();
const User = require('../../auth/models/userModel'); // Fix the import path
const authMiddleware = require('../../../middleware/authMiddleware');
const { upload, handleUploadError } = require('../../../utils/fileUpload');
const settingsController = require('../controllers/settingsController');
const backupController = require('../controllers/backupController');
const multer = require('multer');
const templateUpload = multer({ dest: 'uploads/' });
const templateController = require('../controllers/templateController');
const documentController = require('../controllers/documentController'); // Add documentController

// Debug middleware
router.use((req, res, next) => {
  console.log('[SettingsRoute]', req.method, req.path);
  next();
});

// Base route to test API
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Settings API is working',
    timestamp: new Date().toISOString()
  });
});

// Ensure auth middleware is applied to all routes
router.use(authMiddleware);

// General Settings
router.get('/general', async (req, res) => {
  try {
    const settings = await settingsController.getSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

router.put('/general', settingsController.updateSettings);

// Logo Management
router.post(
  '/logo', 
  upload.single('logo'),
  handleUploadError,
  settingsController.uploadLogo
);
router.delete('/logo', settingsController.deleteLogo);

// Theme route
router.put('/theme', settingsController.updateTheme);

// Advanced Settings
router.put('/advanced', settingsController.updateAdvancedSettings);

// Template routes - Update route order and ensure all handlers exist
router.get('/documents/class-data', documentController.getClassAndSectionData); // Add new route
router.get('/templates/type/:type', templateController.getTemplatesByType);
router.get('/templates/categories', templateController.getTemplateCategories);
router.get('/templates/:id', templateController.getTemplateById);
router.get('/templates', templateController.getAllTemplates);
router.post('/templates/set-active', templateController.setActiveTemplate);
router.get('/templates/seeded/:type', templateController.getSeededTemplate); // Add new route for seeded templates
router.put('/templates/:id', templateController.updateTemplate);
router.delete('/templates/:id', templateController.deleteTemplate);

// Replace the sections route with direct database query
router.get('/sections/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const Section = require('../../academic/models/sectionModel');
    
    const sections = await Section.find({ 
      class: classId,
      isActive: true 
    })
    .select('_id name')
    .sort({ name: 1 })
    .lean();

    res.json({
      success: true,
      message: 'Sections retrieved successfully',
      data: sections
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sections'
    });
  }
});

// Backup Management
router.get('/backup/history', backupController.getBackupHistory);
router.post('/backup/create', backupController.createBackup);
router.post('/backup/restore/:backupId', backupController.restoreBackup);
router.post('/backup/schedule', backupController.scheduleBackup);
router.get('/backup/schedule', backupController.getBackupSchedule);
router.delete('/backup/:backupId', backupController.deleteBackup);

// Notification Settings
router.get('/notifications/settings', settingsController.getNotificationSettings);
router.put('/notifications/settings', settingsController.updateNotificationSettings);
router.post('/notifications/test', settingsController.testNotification);
router.get('/notifications/logs', settingsController.getNotificationLogs);

// System Settings
router.get('/system/info', settingsController.getSystemInfo);
router.post('/system/cache/clear', settingsController.clearCache);
router.post('/system/maintenance', settingsController.toggleMaintenanceMode);

// Signature routes - ensure these come before any routes with path parameters
router.get('/signatures/requirements', authMiddleware, settingsController.getSignatureRequirements);
router.get('/signatures', authMiddleware, settingsController.getSignatures);
router.post('/signatures', 
  authMiddleware,
  upload.single('signatureImage'),
  settingsController.createSignature
);
router.put('/signatures/:id', 
  authMiddleware,
  upload.single('signatureImage'),
  settingsController.updateSignature
);
router.delete('/signatures/:id', authMiddleware, settingsController.deleteSignature);

// Document generation route - Add before error handler
router.post('/documents/generate', 
    [
        authMiddleware,
        (req, res, next) => {
            const { documentType, template, data } = req.body;
            
            if (!documentType || !template || !data) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            next();
        }
    ],
    documentController.generateDocument
);

// Update batch document generation route to handle both single and multiple formats
router.post('/documents/generate-batch',
    [
        authMiddleware,
        (req, res, next) => {
            const { documentType, template, students, outputFormat } = req.body;
            
            if (!documentType || !template || !Array.isArray(students) || !outputFormat) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields or invalid students array'
                });
            }

            if (!['single', 'multiple'].includes(outputFormat)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid output format. Must be either "single" or "multiple"'
                });
            }

            next();
        }
    ],
    documentController.generateBatchDocuments
);

// Error Handler
router.use((err, req, res, next) => {
  console.error('Settings Route Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router;
