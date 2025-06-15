// src/routes/parent/attendanceRoute.js
const express = require('express');
const { getStudentAttendance } = require('../../controllers/parent/attendanceController');
const authMiddleware = require('../../middleware/authMiddleware');
const router = express.Router();

router.get('/:studentId', authMiddleware, getStudentAttendance);

module.exports = router;