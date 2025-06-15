const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Student = require('../models/studentModel');
const StudentSettings = require('../models/settingsModel');
const NotificationPreference = require('../models/notificationPreferenceModel');
const { uploadToStorage, deleteFile } = require('../../../utils/fileUpload');
const { hashPassword, comparePassword } = require('../../../utils/passwordUtils');
const User = require('../../auth/models/userModel'); // Add this import

// Profile Settings
exports.getProfile = catchAsync(async (req, res) => {
    const student = await Student.findOne({ user: req.user._id })
        .populate('academicInfo.class', 'name')
        .populate('academicInfo.section', 'name')
        .lean();

    if (!student) {
        return res.status(404).json(
            ApiResponse.error('Student record not found')
        );
    }

    // Format the response data
    const profileData = {
        personalInfo: student.personalInfo,
        academicInfo: student.academicInfo,
        contactInfo: student.contactInfo,
        socialLinks: student.socialLinks || {}
    };

    res.json(ApiResponse.success('Profile retrieved successfully', profileData));
});

exports.updateProfile = catchAsync(async (req, res) => {
    const { personalInfo, contactInfo, socialLinks } = req.body;
    
    // Only allow updating specific fields
    const updatablePersonalInfo = {
        'personalInfo.bloodGroup': personalInfo?.bloodGroup,
        'personalInfo.nationality': personalInfo?.nationality,
        'contactInfo.phone': contactInfo?.phone,
        'contactInfo.alternateContact': contactInfo?.alternateContact,
        'contactInfo.address': contactInfo?.address,
        socialLinks
    };

    const student = await Student.findOneAndUpdate(
        { user: req.user._id },
        { $set: updatablePersonalInfo },
        { new: true, runValidators: true }
    );

    if (!student) {
        return res.status(404).json(
            ApiResponse.error('Student record not found')
        );
    }

    res.json(ApiResponse.success('Profile updated successfully', student));
});

exports.updateAvatar = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }

    const student = await Student.findById(req.user._id);
    if (student.avatar) {
        await deleteFile(student.avatar);
    }

    const avatarUrl = await uploadToStorage(req.file, 'avatars');
    student.avatar = avatarUrl;
    await student.save();

    res.json(ApiResponse.success('Avatar updated successfully', { avatarUrl }));
});

// Password Management - Updated
exports.updatePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json(
            ApiResponse.error('Current password and new password are required')
        );
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json(
            ApiResponse.error('User record not found')
        );
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
        return res.status(400).json(
            ApiResponse.error('Current password is incorrect')
        );
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json(ApiResponse.success('Password updated successfully'));
});

// Notification Settings
exports.getNotificationSettings = catchAsync(async (req, res) => {
    const settings = await NotificationPreference.findOne({ student: req.user._id });
    res.json(ApiResponse.success('Notification settings retrieved', settings));
});

exports.updateNotificationSettings = catchAsync(async (req, res) => {
    const settings = await NotificationPreference.findOneAndUpdate(
        { student: req.user._id },
        { 
            ...req.body,
            updatedAt: new Date()
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Notification settings updated', settings));
});

// General Settings
exports.getGeneralSettings = catchAsync(async (req, res) => {
    const settings = await StudentSettings.findOne({ student: req.user._id });
    res.json(ApiResponse.success('Settings retrieved successfully', settings));
});

exports.updateGeneralSettings = catchAsync(async (req, res) => {
    const {
        preferredLanguage,
        timezone,
        dateFormat,
        theme,
        fontSize,
        accessibility
    } = req.body;

    const settings = await StudentSettings.findOneAndUpdate(
        { student: req.user._id },
        {
            preferredLanguage,
            timezone,
            dateFormat,
            theme,
            fontSize,
            accessibility,
            updatedAt: new Date()
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Settings updated successfully', settings));
});

module.exports = exports;