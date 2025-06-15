const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../../../middleware/authMiddleware');
const fs = require('fs');

// Configure multer for logo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../../uploads/logos');
        // Ensure directory exists with proper permissions
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `logo-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept png and other image formats
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PNG, JPEG, and GIF images are allowed!'), false);
        }
    }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../../uploads/logos');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log('[Settings Route]:', {
        method: req.method,
        path: req.originalUrl,
        body: req.body
    });
    next();
});

// Basic settings routes - handle both GET and PUT at root level
router.route('/')
    .get(settingsController.getSettings)
    .put(settingsController.updateSettings); // No auth required for now

// Logo management routes - add error handling
router.route('/logo')
    .post(upload.single('logo'), (req, res, next) => {
        try {
            settingsController.uploadLogo(req, res, next);
        } catch (error) {
            console.error('Logo upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload logo'
            });
        }
    })
    .delete(settingsController.deleteLogo);

// Theme settings
router.route('/theme')
    .get((req, res) => {
        res.json({
            success: true,
            data: { themeColor: '#1976d2' }
        });
    })
    .post(settingsController.updateSettings);

// Advanced settings
router.route('/advanced')
    .get((req, res) => {
        res.json({
            success: true,
            data: {
                maintenance: false,
                debugMode: false,
                allowRegistration: true,
                emailNotifications: true,
                smsNotifications: false
            }
        });
    })
    .post(settingsController.updateSettings);

// Remove the duplicate /general routes since we have root routes
// router.get('/general', settingsController.getSettings);
// router.put('/general', settingsController.updateSettings);

module.exports = router;
