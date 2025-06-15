const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const PredefinedSyllabus = require('../models/syllabusModel');

exports.createSyllabus = catchAsync(async (req, res) => {
    const syllabus = await PredefinedSyllabus.create({
        ...req.body,
        createdBy: req.user._id
    });
    
    res.status(201).json(ApiResponse.success('Syllabus created successfully', syllabus));
});

exports.getSyllabus = catchAsync(async (req, res) => {
    const { class: classId, subject, status } = req.query;
    const query = {};

    if (classId) query.class = classId;
    if (subject) query.subject = subject;
    if (status) query.status = status;

    const syllabuses = await PredefinedSyllabus.find(query)
        .populate('class', 'name')
        .populate('subject', 'name')
        .populate('createdBy', 'name')
        .populate('approvedBy', 'name')
        .sort('-createdAt');

    res.json(ApiResponse.success('Syllabuses retrieved successfully', syllabuses));
});

exports.updateSyllabus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const syllabus = await PredefinedSyllabus.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true }
    );

    if (!syllabus) {
        return res.status(404).json(ApiResponse.error('Syllabus not found'));
    }

    res.json(ApiResponse.success('Syllabus updated successfully', syllabus));
});

exports.submitForApproval = catchAsync(async (req, res) => {
    const { id } = req.params;
    const syllabus = await PredefinedSyllabus.findByIdAndUpdate(
        id,
        { status: 'pending' },
        { new: true }
    );
    
    res.json(ApiResponse.success('Syllabus submitted for approval', syllabus));
});

exports.approveSyllabus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const syllabus = await PredefinedSyllabus.findByIdAndUpdate(
        id,
        { 
            status: 'approved',
            approvedBy: req.user._id
        },
        { new: true }
    );
    
    res.json(ApiResponse.success('Syllabus approved successfully', syllabus));
});

exports.publishSyllabus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const syllabus = await PredefinedSyllabus.findByIdAndUpdate(
        id,
        { status: 'published' },
        { new: true }
    );
    
    res.json(ApiResponse.success('Syllabus published successfully', syllabus));
});