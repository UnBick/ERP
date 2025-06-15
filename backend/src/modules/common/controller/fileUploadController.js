const multer = require('multer');
const path = require('path');
const express = require('express');
const router = express.Router();

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

// Initialize multer
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const isExcel = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isPDF = file.mimetype === 'application/pdf';
    if (isExcel || isPDF) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and PDF files are allowed!'), false);
    }
  },
});

// Upload endpoint
const uploadFile = (req, res) => {
  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
};

// Express route for file upload
router.post('/upload', upload.single('file'), uploadFile);

module.exports = {
  router,
  uploadFile
};