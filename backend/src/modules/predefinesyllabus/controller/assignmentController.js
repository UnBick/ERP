const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Assignment = require('../models/assignmentModel');
const upload = require('../../../utils/fileUpload');

exports.createAssignment = catchAsync(async (req, res) => {
    const assignment = await Assignment.create({
        ...req.body,
        createdBy: req.user._id,
        attachments: req.files?.map(file => ({
            fileName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
            uploadedAt: new Date()
        }))
    });

    res.status(201).json(ApiResponse.success('Assignment created successfully', assignment));
});

exports.getAssignments = catchAsync(async (req, res) => {
    const { class: classId, subject, status } = req.query;
    const query = {};
    
    if (classId) query.class = classId;
    if (subject) query.subject = subject;
    if (status) query.status = status;

    const assignments = await Assignment.find(query)
        .populate('class', 'name')
        .populate('subject', 'name')
        .populate('createdBy', 'name')
        .sort('-createdAt');

    res.json(ApiResponse.success('Assignments retrieved successfully', assignments));
});

exports.updateAssignment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndUpdate(
        id,
        {
            ...req.body,
            attachments: req.files ? [
                ...assignment.attachments,
                ...req.files.map(file => ({
                    fileName: file.originalname,
                    filePath: file.path,
                    fileType: file.mimetype,
                    uploadedAt: new Date()
                }))
            ] : assignment.attachments
        },
        { new: true }
    );

    res.json(ApiResponse.success('Assignment updated successfully', assignment));
});

exports.submitAssignment = catchAsync(async (req, res) => {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
        return res.status(404).json(ApiResponse.error('Assignment not found'));
    }

    if (new Date() > assignment.dueDate) {
        return res.status(400).json(ApiResponse.error('Assignment submission deadline has passed'));
    }

    const submission = {
        student: req.user.studentId,
        submittedAt: new Date(),
        filePath: req.file.path
    };

    assignment.submissions.push(submission);
    await assignment.save();

    res.json(ApiResponse.success('Assignment submitted successfully', submission));
});

exports.gradeAssignment = catchAsync(async (req, res) => {
    const { id, submissionId } = req.params;
    const { grade, remarks } = req.body;

    const assignment = await Assignment.findById(id);
    const submission = assignment.submissions.id(submissionId);
    
    if (!submission) {
        return res.status(404).json(ApiResponse.error('Submission not found'));
    }

    submission.grade = grade;
    submission.remarks = remarks;
    submission.status = 'graded';
    
    await assignment.save();

    res.json(ApiResponse.success('Assignment graded successfully', submission));
});