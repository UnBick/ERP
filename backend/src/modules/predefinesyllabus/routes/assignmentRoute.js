const express = require('express');
const { uploadAssignment, getAssignments } = require('../../controllers/predefinesyllabus/assignmentController');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

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

router.post('/', authMiddleware, roleMiddleware(['admin', 'teacher']), upload.single('assignment'), uploadAssignment);
router.get('/', authMiddleware, getAssignments);

module.exports = router;