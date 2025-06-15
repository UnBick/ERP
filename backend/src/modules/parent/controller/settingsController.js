const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Parent = require('../models/parentModel');
const User = require('../../auth/models/userModel');
const ParentSettings = require('../models/parentSettingsModel');
const { uploadToCloud, uploadToStorage, deleteFile } = require('../../../utils/fileUpload');
const { hashPassword, comparePassword } = require('../../../utils/passwordUtils');

// Profile Management
exports.getProfile = catchAsync(async (req, res) => {
    try {
        console.log('Fetching profile for user:', req.user._id);

        // First find the parent document
        const parent = await Parent.findOne({ user: req.user._id })
            .populate({
                path: 'children',
                select: 'personalInfo.firstName personalInfo.lastName academicInfo.class academicInfo.section',
                populate: [
                    { 
                        path: 'academicInfo.class',
                        model: 'Class',
                        select: 'name'
                    },
                    { 
                        path: 'academicInfo.section',
                        model: 'Section',
                        select: 'name'
                    }
                ]
            })
            .populate('user', 'email');

        if (!parent) {
            console.log('Parent not found for user:', req.user._id);
            return res.status(404).json(
                ApiResponse.error('Parent profile not found')
            );
        }

        console.log('Parent found:', parent._id);

        // Format the response data
        const profileData = {
            personalInfo: {
                name: parent.name || '',
                email: parent.user?.email || '',
                phone: parent.contact || '',
                alternateContact: parent.alternateContact || '',
                occupation: parent.occupation || '',
                employer: parent.employer || '',
                education: parent.education || '',
                annualIncome: parent.annualIncome || '',
                relationship: parent.relationship || ''
            },
            contactInfo: {
                address: parent.address || '',
                officeAddress: parent.officeAddress || ''
            },
            children: parent.children.map(child => ({
                id: child._id,
                name: `${child.personalInfo?.firstName || ''} ${child.personalInfo?.lastName || ''}`.trim(),
                class: child.academicInfo?.class?.name || 'N/A',
                section: child.academicInfo?.section?.name || 'N/A'
            })) || [],
            emergencyContact: parent.emergencyContact || {},
            avatar: parent.avatar || null
        };

        console.log('Sending profile data:', {
            userId: req.user._id,
            parentId: parent._id,
            childrenCount: profileData.children.length
        });

        return res.json(ApiResponse.success('Profile retrieved successfully', profileData));
    } catch (error) {
        console.error('Error in getProfile:', error);
        return res.status(500).json(
            ApiResponse.error('Internal server error while retrieving profile')
        );
    }
});

exports.updateProfile = catchAsync(async (req, res) => {
    const { personalInfo, contactInfo, emergencyContact } = req.body;
    
    const updatedParent = await Parent.findOneAndUpdate(
        { user: req.user._id },
        {
            $set: {
                contact: personalInfo.phone,
                alternateContact: personalInfo.alternateContact,
                occupation: personalInfo.occupation,
                employer: personalInfo.employer,
                education: personalInfo.education,
                annualIncome: personalInfo.annualIncome,
                address: contactInfo.address,
                officeAddress: contactInfo.officeAddress,
                emergencyContact
            }
        },
        { new: true, runValidators: true }
    );

    if (!updatedParent) {
        return res.status(404).json(
            ApiResponse.error('Parent profile not found')
        );
    }

    res.json(ApiResponse.success('Profile updated successfully', updatedParent));
});

exports.updateAvatar = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(
            ApiResponse.error('No file uploaded')
        );
    }

    const parent = await Parent.findOne({ user: req.user._id });
    if (parent.avatar) {
        await deleteFile(parent.avatar);
    }

    const avatarUrl = await uploadToStorage(req.file, 'parent-avatars');
    parent.avatar = avatarUrl;
    await parent.save();

    res.json(ApiResponse.success('Avatar updated successfully', { avatarUrl }));
});

// Password Management
exports.updatePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json(ApiResponse.error('Current password is incorrect'));
    }

    // Validate password history
    const settings = await ParentSettings.findOne({ user: req.user._id });
    if (settings?.security?.passwordHistory?.some(
        async (hist) => await comparePassword(newPassword, hist.password)
    )) {
        return res.status(400).json(ApiResponse.error('Password has been used recently'));
    }

    // Update password and save to history
    user.password = await hashPassword(newPassword);
    await user.save();

    if (settings) {
        settings.security.passwordHistory.push({
            password: await hashPassword(newPassword),
            changedAt: new Date()
        });
        await settings.save();
    }

    res.json(ApiResponse.success('Password updated successfully'));
});

// Notification Settings
exports.getNotificationSettings = catchAsync(async (req, res) => {
    const settings = await ParentSettings.findOne({ user: req.user._id }) || 
        await ParentSettings.create({ user: req.user._id });

    res.json(ApiResponse.success('Notification settings retrieved', settings.notifications));
});

exports.updateNotificationSettings = catchAsync(async (req, res) => {
    const { email, sms, app } = req.body;
    
    const settings = await ParentSettings.findOneAndUpdate(
        { user: req.user._id },
        {
            notifications: {
                email,
                sms,
                app
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Notification settings updated', settings.notifications));
});

// General Settings
exports.getGeneralSettings = catchAsync(async (req, res) => {
    const settings = await ParentSettings.findOne({ user: req.user._id }) || 
        await ParentSettings.create({ user: req.user._id });

    res.json(ApiResponse.success('General settings retrieved', {
        ...settings.general,
        email: req.user.email,
        phoneNumber: settings.phoneNumber
    }));
});

exports.updateGeneralSettings = catchAsync(async (req, res) => {
    const { language, timeZone, dateFormat, theme, emailNotifications, smsNotifications, appNotifications } = req.body;

    const settings = await ParentSettings.findOneAndUpdate(
        { user: req.user._id },
        {
            general: {
                language,
                timeZone,
                dateFormat,
                theme
            },
            notifications: {
                email: emailNotifications,
                sms: smsNotifications,
                app: appNotifications
            }
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('General settings updated', settings.general));
});

// Security Settings
exports.getSecuritySettings = catchAsync(async (req, res) => {
    const settings = await ParentSettings.findOne({ user: req.user._id });
    
    res.json(ApiResponse.success('Security settings retrieved', settings?.security || {}));
});

exports.updateSecuritySettings = catchAsync(async (req, res) => {
    const { twoFactorEnabled, passwordExpiry, strongPassword } = req.body;

    const settings = await ParentSettings.findOneAndUpdate(
        { user: req.user._id },
        {
            'security.twoFactorEnabled': twoFactorEnabled,
            'security.passwordExpiry': passwordExpiry,
            'security.strongPassword': strongPassword
        },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Security settings updated', settings.security));
});

module.exports = exports;