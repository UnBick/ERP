const express = require('express');
const router = express.Router();
const { 
    submitAdmission,
    uploadDocuments,
    getAdmissionRequests,
    getAdmissionDetails,
    updateAdmissionStatus,
    bulkUpdateAdmissions,
    getAdmissionStats
} = require('../controllers/admissionController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateAdmin } = require('../../../middleware/roleMiddleware');
const upload = require('../../../middleware/uploadMiddleware');

// Public routes
router.post(
    '/submit',
    upload.array('documents'),
    submitAdmission
);

router.post(
    '/documents',
    upload.array('documents', 5),
    uploadDocuments
);

// Protected routes
router.get(
    '/requests',
    [authMiddleware, validateAdmin],
    getAdmissionRequests
);

router.get(
    '/stats',
    [authMiddleware, validateAdmin],
    getAdmissionStats
);

router.get(
    '/:id',
    [authMiddleware, validateAdmin],
    getAdmissionDetails
);

router.patch(
    '/:id/status',
    [authMiddleware, validateAdmin],
    updateAdmissionStatus
);

router.post(
    '/bulk-update',
    [authMiddleware, validateAdmin],
    bulkUpdateAdmissions
);

module.exports = router;