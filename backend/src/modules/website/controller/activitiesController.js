const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Activity = require('../models/activitiesModel');
const Club = require('../models/clubModel');
const Assembly = require('../models/assemblyModel');
const Workshop = require('../models/workshopModel');
const InterHouse = require('../models/interHouseModel');
const Sports = require('../models/sportsModel');
const { uploadToStorage } = require('../../../utils/fileUpload');

// Clubs Management
exports.getClubs = catchAsync(async (req, res) => {
    const clubs = await Club.find()
        .populate('incharge', 'name email')
        .sort('name');
    res.json(ApiResponse.success('Clubs fetched successfully', clubs));
});

exports.createClub = catchAsync(async (req, res) => {
    const clubData = req.body;
    if (req.file) {
        clubData.image = await uploadToStorage(req.file, 'clubs');
    }
    
    const club = await Club.create({
        ...clubData,
        createdBy: req.user._id
    });
    
    res.status(201).json(ApiResponse.success('Club created successfully', club));
});

exports.updateClub = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (req.file) {
        updateData.image = await uploadToStorage(req.file, 'clubs');
    }

    const club = await Club.findByIdAndUpdate(id, updateData, { new: true });
    res.json(ApiResponse.success('Club updated successfully', club));
});

// Assemblies Management
exports.getAssemblies = catchAsync(async (req, res) => {
    const assemblies = await Assembly.find()
        .populate('class incharge')
        .sort('-date');
    res.json(ApiResponse.success('Assemblies fetched successfully', assemblies));
});

exports.manageAssembly = catchAsync(async (req, res) => {
    const { id } = req.params;
    const assemblyData = req.body;

    const assembly = id 
        ? await Assembly.findByIdAndUpdate(id, assemblyData, { new: true })
        : await Assembly.create(assemblyData);

    res.json(ApiResponse.success('Assembly saved successfully', assembly));
});

// Cultural Activities
exports.getCulturalActivities = catchAsync(async (req, res) => {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const activities = await Activity.find({ ...filter, type: 'cultural' })
        .sort('-date');
    res.json(ApiResponse.success('Cultural activities fetched', activities));
});

exports.manageCulturalActivity = catchAsync(async (req, res) => {
    const { id } = req.params;
    const activityData = req.body;

    if (req.files?.length) {
        activityData.images = await Promise.all(
            req.files.map(file => uploadToStorage(file, 'cultural'))
        );
    }

    const activity = id
        ? await Activity.findByIdAndUpdate(id, activityData, { new: true })
        : await Activity.create({ ...activityData, type: 'cultural' });

    res.json(ApiResponse.success('Cultural activity saved', activity));
});

// Inter-House Events
exports.getInterHouseEvents = catchAsync(async (req, res) => {
    const events = await InterHouse.find()
        .populate('participants.house')
        .sort('-date');
    res.json(ApiResponse.success('Inter-house events fetched', events));
});

exports.manageInterHouseEvent = catchAsync(async (req, res) => {
    const { id } = req.params;
    const eventData = req.body;

    const event = id
        ? await InterHouse.findByIdAndUpdate(id, eventData, { new: true })
        : await InterHouse.create(eventData);

    res.json(ApiResponse.success('Inter-house event saved', event));
});

// Sports Management
exports.getSportsContent = catchAsync(async (req, res) => {
    const { category } = req.params;
    const filter = category ? { category } : {};
    
    const sports = await Sports.find(filter)
        .populate('facilities achievements');
    res.json(ApiResponse.success('Sports content fetched', sports));
});

exports.updateSportsContent = catchAsync(async (req, res) => {
    const { category } = req.params;
    const contentData = req.body;

    if (req.files?.length) {
        contentData.images = await Promise.all(
            req.files.map(file => uploadToStorage(file, 'sports'))
        );
    }

    const content = await Sports.findOneAndUpdate(
        { category },
        contentData,
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Sports content updated', content));
});

// Workshops Management
exports.getWorkshops = catchAsync(async (req, res) => {
    const workshops = await Workshop.find()
        .populate('instructor')
        .sort('-date');
    res.json(ApiResponse.success('Workshops fetched successfully', workshops));
});

exports.manageWorkshop = catchAsync(async (req, res) => {
    const { id } = req.params;
    const workshopData = req.body;

    if (req.files?.length) {
        workshopData.images = await Promise.all(
            req.files.map(file => uploadToStorage(file, 'workshops'))
        );
    }

    const workshop = id
        ? await Workshop.findByIdAndUpdate(id, workshopData, { new: true })
        : await Workshop.create(workshopData);

    res.json(ApiResponse.success('Workshop saved successfully', workshop));
});

// Common File Upload Handler
exports.uploadFile = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const fileUrl = await uploadToStorage(req.file, req.body.type);
    res.json(ApiResponse.success('File uploaded successfully', { fileUrl }));
});

module.exports = exports;