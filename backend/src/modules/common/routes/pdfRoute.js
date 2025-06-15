// backend/src/routes/pdfRoute.js
const express = require('express');
const { uploadPDF, getPDFs, viewPDF } = require('../controllers/pdfController');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/upload', authMiddleware, roleMiddleware('admin'), upload.single('pdf'), uploadPDF);
router.get('/', authMiddleware, getPDFs);
router.get('/view/:id', authMiddleware, viewPDF);

module.exports = router;