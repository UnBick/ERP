const Teacher = require('../../staff/models/staffModel');
const catchAsync = require('../../../utils/catchAsync');
const { uploadToStorage, deleteFile } = require('../../../utils/fileUpload');

exports.getProfile = catchAsync(async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      $or: [
        { email: req.user.email },
        { staffID: req.user.staffID }
      ]
    }).select('-salary'); // Exclude sensitive information

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: teacher
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

exports.updateProfile = catchAsync(async (req, res) => {
  try {
    const teacher = await Teacher.findOneAndUpdate(
      {
        $or: [
          { email: req.user.email },
          { staffID: req.user.staffID }
        ]
      },
      {
        $set: {
          ...req.body,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('-salary');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: teacher
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

exports.uploadProfilePhoto = catchAsync(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo uploaded'
      });
    }

    const teacher = await Teacher.findOne({
      $or: [
        { email: req.user.email },
        { staffID: req.user.staffID }
      ]
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher profile not found'
      });
    }

    // Delete old photo if exists
    if (teacher.avatar) {
      await deleteFile(teacher.avatar);
    }

    // Upload new photo
    const photoUrl = await uploadToStorage(req.file, 'teacher-profiles');

    // Update teacher profile
    teacher.avatar = photoUrl;
    await teacher.save();

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      data: { photoUrl }
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message
    });
  }
});
