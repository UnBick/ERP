const express = require('express');
const router = express.Router();
const { generateDocument } = require('../controllers/serviceController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateAdmin, validateTeacher } = require('../../../middleware/roleMiddleware');

/**
 * Document generation routes
 * Supports: Report Cards, Transfer Certificates, ID Cards, Character Certificates
 */
router.post(
    '/document/generate',
    [
        authMiddleware,
        validateTeacher,
        // Additional middleware to validate document type and scope
        (req, res, next) => {
            const { documentType, scope } = req.body;
            const validTypes = ['REPORT_CARD', 'TRANSFER_CERT', 'ID_CARD', 'CHARACTER_CERT'];
            const validScopes = ['INDIVIDUAL', 'SECTION', 'CLASS', 'SCHOOL'];
            
            if (!validTypes.includes(documentType)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid document type'
                });
            }
            
            if (!validScopes.includes(scope)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid scope'
                });
            }
            
            next();
        }
    ],
    generateDocument
);

// Restricted document types requiring admin approval
router.post(
    '/document/generate/restricted',
    [
        authMiddleware,
        validateAdmin
    ],
    generateDocument
);

module.exports = router;