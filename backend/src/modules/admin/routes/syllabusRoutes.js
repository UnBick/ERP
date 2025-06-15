const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../../uploads/syllabus'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Routes
router.get('/', async (req, res) => {
  try {
    const syllabuses = await Syllabus.find({ isActive: true }).sort('-createdAt');
    res.json({ success: true, data: syllabuses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const syllabus = new Syllabus({
      ...req.body,
      fileUrl: req.file ? `/uploads/syllabus/${req.file.filename}` : null
    });
    await syllabus.save();
    res.json({ success: true, data: syllabus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ... add other routes for update and delete ...

module.exports = router;
