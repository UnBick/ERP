const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Teacher = require('../models/teacherModel');
const User = require('../../auth/models/user');
const Settings = require('../models/settingsModel');
const { uploadToCloud } = require('../../../utils/fileUpload');
const { hashPassword, comparePassword } = require('../../../utils/passwordUtils');

// Profile Management
exports.getProfile = catchAsync(async (req, res) => {
    const teacher = await Teacher.findOne({ user: req.user._id })
        .populate('user', '-password')
        .populate('qualifications')
        .populate('subjects');

    if (!teacher) {
        return res.status(404).json(ApiResponse.error('Teacher profile not found'));
    }

    res.json(ApiResponse.success('Profile retrieved successfully', teacher));
});

exports.updateProfile = catchAsync(async (req, res) => {
    console.log('Update profile request:', {
        body: req.body,
        file: req.file
    });

    const teacher = await Teacher.findOne({ user: req.user._id });

    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher profile not found'
        });
    }

    try {
        let avatarUrl = null;
        
        // Handle avatar upload
        if (req.file) {
            avatarUrl = await uploadToCloud(req.file);
            teacher.avatar = avatarUrl;
            await teacher.save();
        }

        // Handle other profile updates
        if (req.body && Object.keys(req.body).length > 0) {
            Object.keys(req.body).forEach(key => {
                if (key !== 'avatar') {
                    teacher[key] = req.body[key];
                }
            });
            await teacher.save();
        }

        return res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                avatar: avatarUrl || teacher.avatar,
                ...teacher.toJSON()
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating profile: ' + error.message
        });
    }
});

// Password Management
exports.updatePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // Update password
    user.password = await hashPassword(newPassword);
    await user.save();

    return res.json({
        success: true,
        message: 'Password updated successfully'
    });
});

// Notification Settings
exports.getNotificationSettings = catchAsync(async (req, res) => {
    const settings = await Settings.findOne({ user: req.user._id }) || 
        await Settings.create({ user: req.user._id });

    res.json(ApiResponse.success('Notification settings retrieved', settings.notifications));
});

exports.updateNotificationSettings = catchAsync(async (req, res) => {
    const { notifications } = req.body;
    const settings = await Settings.findOneAndUpdate(
        { user: req.user._id },
        { 'notifications': notifications },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Notification settings updated', settings.notifications));
});

// General Settings
exports.getGeneralSettings = catchAsync(async (req, res) => {
    const settings = await Settings.findOne({ user: req.user._id }) || 
        await Settings.create({ user: req.user._id });

    res.json(ApiResponse.success('General settings retrieved', settings.general));
});

exports.updateGeneralSettings = catchAsync(async (req, res) => {
    const { general } = req.body;
    const settings = await Settings.findOneAndUpdate(
        { user: req.user._id },
        { 'general': general },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('General settings updated', settings.general));
});

// Security Settings
exports.updateSecuritySettings = catchAsync(async (req, res) => {
    const { twoFactorEnabled, securityQuestions } = req.body;
    const settings = await Settings.findOneAndUpdate(
        { user: req.user._id },
        { 
            'security.twoFactorEnabled': twoFactorEnabled,
            'security.securityQuestions': securityQuestions 
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Security settings updated', settings.security));
});

// Password History
exports.getPasswordHistory = catchAsync(async (req, res) => {
    const settings = await Settings.findOne({ user: req.user._id })
        .select('security.passwordHistory');

    res.json(ApiResponse.success('Password history retrieved', settings?.security?.passwordHistory || []));
});

// Helper function to validate password strength
const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
        isValid: password.length >= minLength && hasUpperCase && hasLowerCase && 
                hasNumbers && hasSpecialChars,
        strength: [
            password.length >= minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChars
        ].filter(Boolean).length * 20
    };
};

module.exports = exports;