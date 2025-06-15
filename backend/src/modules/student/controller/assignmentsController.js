const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Assignment = require('../../predefinesyllabus/models/assignmentModel');
const AssignmentSubmission = require('../models/assignmentSubmissionModel');
const { uploadToStorage } = require('../../../utils/fileUpload');

exports.getAssignments = catchAsync(async (req, res) => {
    const { sortBy = 'dueDate', status = 'all' } = req.query;
    
    // Build filter conditions
    const filter = { 
        class: req.user.class,
        section: req.user.section
    };
    
    if (status !== 'all') {
        const submissions = await AssignmentSubmission.find({ 
            student: req.user._id 
        }).select('assignment');
        
        const submittedAssignmentIds = submissions.map(s => s.assignment);
        
        if (status === 'submitted') {
            filter._id = { $in: submittedAssignmentIds };
        } else if (status === 'pending') {
            filter._id = { $nin: submittedAssignmentIds };
        }
    }

    // Build sort conditions
    const sortOptions = {
        dueDate: { dueDate: 1 },
        title: { title: 1 },
        status: { status: 1 }
    };

    const assignments = await Assignment.find(filter)
        .sort(sortOptions[sortBy] || sortOptions.dueDate)
        .populate('subject', 'name')
        .populate('teacher', 'name')
        .lean();

    // Enhance assignments with submission status
    const submissions = await AssignmentSubmission.find({
        student: req.user._id,
        assignment: { $in: assignments.map(a => a._id) }
    });

    const enhancedAssignments = assignments.map(assignment => ({
        ...assignment,
        status: submissions.find(s => s.assignment.equals(assignment._id)) 
            ? 'submitted' 
            : 'pending'
    }));

    res.json(ApiResponse.success('Assignments retrieved successfully', enhancedAssignments));
});

exports.submitAssignment = catchAsync(async (req, res) => {
    const { assignmentId } = req.params;
    const { comment } = req.body;

    // Validate assignment exists and is not past due date
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
        return res.status(404).json(ApiResponse.error('Assignment not found'));
    }

    if (new Date() > assignment.dueDate) {
        return res.status(400).json(ApiResponse.error('Assignment submission deadline has passed'));
    }

    // Check for existing submission
    const existingSubmission = await AssignmentSubmission.findOne({
        student: req.user._id,
        assignment: assignmentId
    });

    if (existingSubmission) {
        return res.status(400).json(ApiResponse.error('Assignment already submitted'));
    }

    // Handle file upload
    let fileUrl;
    if (req.file) {
        fileUrl = await uploadToStorage(req.file, 'assignments');
    }

    // Create submission
    const submission = await AssignmentSubmission.create({
        student: req.user._id,
        assignment: assignmentId,
        comment,
        fileUrl,
        submittedAt: new Date()
    });

    // Update assignment status
    assignment.submissions.push(submission._id);
    await assignment.save();

    res.status(201).json(ApiResponse.success('Assignment submitted successfully', submission));
});

exports.getSubmissionDetails = catchAsync(async (req, res) => {
    const { assignmentId } = req.params;

    const submission = await AssignmentSubmission.findOne({
        student: req.user._id,
        assignment: assignmentId
    }).populate('assignment');

    if (!submission) {
        return res.status(404).json(ApiResponse.error('Submission not found'));
    }

    res.json(ApiResponse.success('Submission details retrieved', submission));
});

exports.getAssignmentById = catchAsync(async (req, res) => {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId)
        .populate('subject', 'name')
        .populate('teacher', 'name');

    if (!assignment) {
        return res.status(404).json(ApiResponse.error('Assignment not found'));
    }

    const submission = await AssignmentSubmission.findOne({
        student: req.user._id,
        assignment: assignmentId
    });

    const enhancedAssignment = {
        ...assignment.toObject(),
        status: submission ? 'submitted' : 'pending',
        submission: submission
    };

    res.json(ApiResponse.success('Assignment details retrieved', enhancedAssignment));
});

module.exports = exports;