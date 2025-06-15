const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const HomePage = require('../models/homepageModel');
const Notice = require('../models/noticeModel');
const Event = require('../models/eventModel');
const Gallery = require('../models/galleryModel');
const Achievement = require('../models/achievementModel');
const { uploadToStorage, deleteFile } = require('../../../utils/fileUpload');

// Section Status Management
exports.getSectionsStatus = catchAsync(async (req, res) => {
    const homepage = await HomePage.findOne();
    const sectionsStatus = {
        hero: {
            isConfigured: Boolean(homepage?.hero?.title),
            isActive: homepage?.hero?.isActive ?? false,
            status: 'required'
        },
        notices: {
            isConfigured: Boolean(homepage?.notices?.length),
            isActive: homepage?.noticesEnabled ?? false,
            status: 'required'
        },
        gallery: {
            isConfigured: Boolean(homepage?.gallery?.images?.length),
            isActive: homepage?.gallery?.isActive ?? false,
            status: 'optional'
        },
        achievements: {
            isConfigured: Boolean(homepage?.achievements?.length),
            isActive: homepage?.achievementsEnabled ?? false,
            status: 'optional'
        },
        events: {
            isConfigured: Boolean(homepage?.events?.enabled),
            isActive: homepage?.events?.isActive ?? false,
            status: 'optional'
        }
    };

    res.json(ApiResponse.success('Sections status retrieved', sectionsStatus));
});

// Hero Section Management
exports.updateHero = catchAsync(async (req, res) => {
    const { title, subtitle, backgroundType, backgroundUrl, buttons, overlay } = req.body;

    const homepage = await HomePage.findOneAndUpdate(
        {},
        {
            'hero': {
                title,
                subtitle,
                backgroundType,
                backgroundUrl,
                buttons,
                overlay,
                isActive: true,
                lastUpdated: {
                    by: req.user._id,
                    date: new Date()
                }
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Hero section updated', homepage.hero));
});

// Notice Management
exports.getNotices = catchAsync(async (req, res) => {
    const notices = await Notice.find({ isActive: true })
        .sort('-priority -createdAt')
        .limit(10);
    res.json(ApiResponse.success('Notices retrieved', notices));
});

exports.updateNotice = catchAsync(async (req, res) => {
    const { id } = req.params;
    const noticeData = req.body;

    const notice = id
        ? await Notice.findByIdAndUpdate(id, noticeData, { new: true })
        : await Notice.create({
            ...noticeData,
            createdBy: req.user._id
        });

    res.json(ApiResponse.success('Notice updated', notice));
});

// Gallery Management
exports.updateGallery = catchAsync(async (req, res) => {
    const { images, settings } = req.body;

    const homepage = await HomePage.findOneAndUpdate(
        {},
        {
            'gallery': {
                images,
                settings,
                isActive: true,
                lastUpdated: {
                    by: req.user._id,
                    date: new Date()
                }
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Gallery updated', homepage.gallery));
});

// Achievement Management
exports.updateAchievements = catchAsync(async (req, res) => {
    const achievements = req.body;

    const homepage = await HomePage.findOneAndUpdate(
        {},
        {
            achievements,
            achievementsEnabled: true,
            'lastUpdated.achievements': {
                by: req.user._id,
                date: new Date()
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Achievements updated', homepage.achievements));
});

// Events Calendar Management
exports.getEvents = catchAsync(async (req, res) => {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const events = await Event.find({
        date: {
            $gte: startDate,
            $lte: endDate
        },
        isActive: true
    }).sort('date');

    res.json(ApiResponse.success('Events retrieved', events));
});

// File Management
exports.uploadMedia = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const fileUrl = await uploadToStorage(req.file, 'homepage');
    res.json(ApiResponse.success('File uploaded', { fileUrl }));
});

// Homepage Preview & Publishing
exports.getPreview = catchAsync(async (req, res) => {
    const homepage = await HomePage.findOne()
        .populate('hero.lastUpdated.by', 'name')
        .populate('notices')
        .populate('events');

    res.json(ApiResponse.success('Homepage preview retrieved', homepage));
});

exports.publishChanges = catchAsync(async (req, res) => {
    const homepage = await HomePage.findOne();
    
    if (!homepage?.hero?.title) {
        return res.status(400).json(ApiResponse.error('Hero section must be configured'));
    }

    if (!homepage?.notices?.length) {
        return res.status(400).json(ApiResponse.error('At least one notice must be configured'));
    }

    homepage.isPublished = true;
    homepage.publishedAt = new Date();
    homepage.publishedBy = req.user._id;
    await homepage.save();

    res.json(ApiResponse.success('Homepage published successfully'));
});

module.exports = exports;