const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Curriculum = require('../models/curriculumModel');
const ArtActivity = require('../models/artActivityModel');
const Facility = require('../models/facilityModel');
const Syllabus = require('../models/syllabusModel');
const ScholarBadge = require('../models/scholarBadgeModel');
const { uploadToStorage } = require('../../../utils/fileUpload');

// Curriculum Management
exports.getCurriculum = catchAsync(async (req, res) => {
    const curriculum = await Curriculum.find()
        .populate('subjects')
        .populate('streamSubjects');

    res.json(ApiResponse.success('Curriculum retrieved successfully', curriculum));
});

exports.updateCurriculum = catchAsync(async (req, res) => {
    const { section, data } = req.body;
    const curriculum = await Curriculum.findOneAndUpdate(
        { section },
        data,
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Curriculum updated successfully', curriculum));
});

// Art Integration Activities
exports.getArtActivities = catchAsync(async (req, res) => {
    const activities = await ArtActivity.find()
        .populate('subject')
        .sort('-createdAt');

    res.json(ApiResponse.success('Art activities retrieved successfully', activities));
});

exports.createArtActivity = catchAsync(async (req, res) => {
    const { title, description, subject, grade } = req.body;
    const images = req.files.map(file => file.path);

    const activity = await ArtActivity.create({
        title,
        description,
        images,
        subject,
        grade
    });

    res.status(201).json(ApiResponse.success('Art activity created successfully', activity));
});

// Facilities Management
exports.getFacilities = catchAsync(async (req, res) => {
    const facilities = await Facility.find()
        .populate('staffInCharge')
        .sort('title');

    res.json(ApiResponse.success('Facilities retrieved successfully', facilities));
});

exports.updateFacility = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, description, staffInCharge } = req.body;
    const images = req.files?.map(file => file.path);

    const facility = await Facility.findByIdAndUpdate(
        id,
        {
            title,
            description,
            staffInCharge,
            ...(images && { images })
        },
        { new: true }
    );

    res.json(ApiResponse.success('Facility updated successfully', facility));
});

// Syllabus Management
exports.getSyllabus = catchAsync(async (req, res) => {
    const { classLevel } = req.params;
    const syllabus = await Syllabus.find({ class: classLevel })
        .populate('subject');

    res.json(ApiResponse.success('Syllabus retrieved successfully', syllabus));
});

exports.uploadSyllabus = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const { title, subject, description } = req.body;
    const fileUrl = await uploadToStorage(req.file, 'syllabus');

    const syllabus = await Syllabus.create({
        title,
        subject,
        description,
        fileUrl,
        uploadedBy: req.user._id
    });

    res.status(201).json(ApiResponse.success('Syllabus uploaded successfully', syllabus));
});

// Scholar Badge Management
exports.getScholarBadgeCriteria = catchAsync(async (req, res) => {
    const criteria = await ScholarBadge.findOne()
        .sort('-createdAt');

    res.json(ApiResponse.success('Scholar badge criteria retrieved', criteria));
});

exports.updateScholarBadgeCriteria = catchAsync(async (req, res) => {
    const { academicScore, attendance, extraCurricular } = req.body;

    const criteria = await ScholarBadge.findOneAndUpdate(
        {},
        {
            criteria: {
                academicScore,
                attendance,
                extraCurricular
            },
            updatedBy: req.user._id
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Scholar badge criteria updated', criteria));
});

exports.getScholarBadgeRecipients = catchAsync(async (req, res) => {
    const { year } = req.query;
    const recipients = await ScholarBadge.find({ year })
        .populate('student')
        .sort('-createdAt');

    res.json(ApiResponse.success('Scholar badge recipients retrieved', recipients));
});

// File Upload Handler
exports.uploadFile = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const fileUrl = await uploadToStorage(req.file, req.body.type);
    res.json(ApiResponse.success('File uploaded successfully', { fileUrl }));
});

module.exports = exports;