const express = require('express');
const { 
    getAssignments,
    submitAssignment,
    getSubmissionDetails,
    getAssignmentById
} = require('../../controllers/student/assignmentsController');
const authMiddleware = require('../../middleware/authMiddleware');
const upload = require('../../middleware/uploadMiddleware');
const router = express.Router();

// Get all assignments with filters
router.get('/', authMiddleware, getAssignments);

// Get specific assignment details
router.get('/:assignmentId', authMiddleware, getAssignmentById);

// Submit an assignment
router.post(
    '/:assignmentId/submit', 
    authMiddleware, 
    upload.single('file'),
    submitAssignment
);

// Get submission details
router.get(
    '/:assignmentId/submission', 
    authMiddleware, 
    getSubmissionDetails
);

module.exports = router;