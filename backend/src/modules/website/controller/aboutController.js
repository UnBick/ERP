const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const AboutContent = require('../models/aboutModel');
const { uploadToStorage } = require('../../../utils/fileUpload');

// About School Management
exports.getAboutContent = catchAsync(async (req, res) => {
    const content = await AboutContent.findOne({ type: 'school' })
        .populate('media.gallery');

    res.json(ApiResponse.success('About content retrieved successfully', content));
});

exports.updateAboutContent = catchAsync(async (req, res) => {
    const { sections, media } = req.body;

    const content = await AboutContent.findOneAndUpdate(
        { type: 'school' },
        {
            sections,
            media,
            lastUpdated: {
                by: req.user._id,
                date: new Date()
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('About content updated successfully', content));
});

// Principal's Message Management
exports.getPrincipalMessage = catchAsync(async (req, res) => {
    const message = await AboutContent.findOne({ type: 'principal' });
    res.json(ApiResponse.success('Principal message retrieved successfully', message));
});

exports.updatePrincipalMessage = catchAsync(async (req, res) => {
    const { name, title, qualifications, message, image, signature } = req.body;

    const content = await AboutContent.findOneAndUpdate(
        { type: 'principal' },
        {
            name,
            title,
            qualifications,
            message,
            image,
            signature,
            lastUpdated: {
                by: req.user._id,
                date: new Date()
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Principal message updated successfully', content));
});

// Philosophy & Mission Management
exports.getPhilosophyMission = catchAsync(async (req, res) => {
    const content = await AboutContent.findOne({ type: 'philosophy' });
    res.json(ApiResponse.success('Philosophy content retrieved successfully', content));
});

exports.updatePhilosophyMission = catchAsync(async (req, res) => {
    const { vision, mission, coreValues } = req.body;

    const content = await AboutContent.findOneAndUpdate(
        { type: 'philosophy' },
        {
            vision,
            mission,
            coreValues,
            lastUpdated: {
                by: req.user._id,
                date: new Date()
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Philosophy content updated successfully', content));
});

// Infrastructure Management
exports.getFacilities = catchAsync(async (req, res) => {
    const facilities = await AboutContent.findOne({ type: 'infrastructure' })
        .populate('facilities.images');
    
    res.json(ApiResponse.success('Facilities retrieved successfully', facilities));
});

exports.updateFacility = catchAsync(async (req, res) => {
    const { facilityId } = req.params;
    const { title, description, images } = req.body;

    const content = await AboutContent.findOneAndUpdate(
        { 
            type: 'infrastructure',
            'facilities.id': facilityId 
        },
        {
            $set: {
                'facilities.$.title': title,
                'facilities.$.description': description,
                'facilities.$.images': images
            }
        },
        { new: true }
    );

    res.json(ApiResponse.success('Facility updated successfully', content));
});

// Awards Management
exports.getAwards = catchAsync(async (req, res) => {
    const awards = await AboutContent.findOne({ type: 'awards' })
        .populate('awards.images');
    
    res.json(ApiResponse.success('Awards retrieved successfully', awards));
});

exports.addAward = catchAsync(async (req, res) => {
    const { title, year, category, description, images } = req.body;

    const content = await AboutContent.findOneAndUpdate(
        { type: 'awards' },
        {
            $push: {
                awards: {
                    title,
                    year,
                    category,
                    description,
                    images
                }
            }
        },
        { new: true }
    );

    res.json(ApiResponse.success('Award added successfully', content));
});

// Student Council Management
exports.getStudentCouncil = catchAsync(async (req, res) => {
    const council = await AboutContent.findOne({ type: 'council' })
        .populate('members.photo');
    
    res.json(ApiResponse.success('Student council retrieved successfully', council));
});

exports.updateCouncilMember = catchAsync(async (req, res) => {
    const { memberId } = req.params;
    const { name, role, class: className, photo, responsibilities } = req.body;

    const content = await AboutContent.findOneAndUpdate(
        { 
            type: 'council',
            'members._id': memberId 
        },
        {
            $set: {
                'members.$': {
                    name,
                    role,
                    class: className,
                    photo,
                    responsibilities
                }
            }
        },
        { new: true }
    );

    res.json(ApiResponse.success('Council member updated successfully', content));
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