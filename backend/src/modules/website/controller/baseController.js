const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const SiteSettings = require('../models/siteSettingsModel');
const ContactInfo = require('../models/contactInfoModel');
const Section = require('../models/sectionModel');
const { uploadToStorage } = require('../../../utils/fileUpload');

// Section Management
exports.getSectionContent = catchAsync(async (req, res) => {
    const { sectionKey } = req.params;
    const section = await Section.findOne({ key: sectionKey })
        .populate('lastUpdated.by', 'name');

    if (!section) {
        return res.status(404).json(ApiResponse.error('Section not found'));
    }

    res.json(ApiResponse.success('Section content retrieved', section));
});

exports.updateSection = catchAsync(async (req, res) => {
    const { sectionKey } = req.params;
    const updateData = req.body;

    const section = await Section.findOneAndUpdate(
        { key: sectionKey },
        {
            ...updateData,
            lastUpdated: {
                by: req.user._id,
                date: new Date()
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Section updated successfully', section));
});

// Contact Information Management
exports.getContactInfo = catchAsync(async (req, res) => {
    const contactInfo = await ContactInfo.findOne()
        .populate('lastUpdated.by', 'name email');

    if (!contactInfo) {
        return res.json(ApiResponse.success('Contact info retrieved', {
            address: '',
            phones: [],
            emails: [],
            location: { lat: 0, lng: 0 },
            footerContent: {
                quickLinks: [],
                socialMedia: {
                    facebook: { url: '', icon: 'fab fa-facebook' },
                    twitter: { url: '', icon: 'fab fa-twitter' },
                    instagram: { url: '', icon: 'fab fa-instagram' },
                    linkedin: { url: '', icon: 'fab fa-linkedin' }
                },
                copyright: `© ${new Date().getFullYear()} School Name`
            }
        }));
    }

    res.json(ApiResponse.success('Contact info retrieved', contactInfo));
});

exports.updateContactInfo = catchAsync(async (req, res) => {
    const {
        address,
        phones,
        emails,
        location,
        footerContent
    } = req.body;

    // Validate location coordinates
    if (location) {
        if (!location.lat || !location.lng) {
            return res.status(400).json(ApiResponse.error('Invalid location coordinates'));
        }
    }

    // Validate phone numbers
    if (phones?.length) {
        const phoneRegex = /^[0-9+\-\s]+$/;
        const invalidPhone = phones.find(p => !phoneRegex.test(p.number));
        if (invalidPhone) {
            return res.status(400).json(ApiResponse.error('Invalid phone number format'));
        }
    }

    // Validate email addresses
    if (emails?.length) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmail = emails.find(e => !emailRegex.test(e.address));
        if (invalidEmail) {
            return res.status(400).json(ApiResponse.error('Invalid email format'));
        }
    }

    const contactInfo = await ContactInfo.findOneAndUpdate(
        {},
        {
            address,
            phones,
            emails,
            location,
            footerContent,
            lastUpdated: {
                by: req.user._id,
                date: new Date()
            }
        },
        { new: true, upsert: true }
    );

    await this.invalidateCache('contactInfo');
    res.json(ApiResponse.success('Contact info updated successfully', contactInfo));
});

// File Management
exports.uploadMedia = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const { type, sectionKey } = req.body;
    const fileUrl = await uploadToStorage(req.file, type);
    
    if (sectionKey) {
        await Section.findOneAndUpdate(
            { key: sectionKey },
            { 
                $push: { media: { url: fileUrl, type: req.file.mimetype } },
                'lastUpdated.by': req.user._id,
                'lastUpdated.date': new Date()
            }
        );
    }

    res.json(ApiResponse.success('File uploaded successfully', { fileUrl }));
});

// Cache Management
exports.invalidateCache = async (key) => {
    // Implement cache invalidation logic
    console.log(`Cache invalidated for key: ${key}`);
};

module.exports = exports;