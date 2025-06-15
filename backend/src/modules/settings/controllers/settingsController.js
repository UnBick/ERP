const fs = require('fs').promises; // Import the promise-based fs module
const os = require('os');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Settings = require('../models/Settings');
const User = require('../models/userModel');
const Template = require('../models/templateModel');
const Signature = require('../models/signatureModel');
const Backup = require('../models/backupModel');
const { uploadToStorage, deleteFile, getFileUrl } = require('../../../utils/fileUpload');
const { generateBackup, restoreBackup } = require('../../../utils/backupUtils');
const { sendTestNotification } = require('../../../utils/notificationUtils');

/** 
 * LOGS ENDPOINTS 
 */

// GET /logs/system or /system/logs
exports.getSystemLogs = catchAsync(async (req, res) => {
  const logData = await fs.readFile('logs/system.log', 'utf8');
  res.json(ApiResponse.success('System logs retrieved successfully', logData));
});

// GET /logs/access
exports.getAccessLogs = catchAsync(async (req, res) => {
  const logData = await fs.readFile('logs/access.log', 'utf8');
  res.json(ApiResponse.success('Access logs retrieved successfully', logData));
});

// GET /logs/error
exports.getErrorLogs = catchAsync(async (req, res) => {
  const logData = await fs.readFile('logs/error.log', 'utf8');
  res.json(ApiResponse.success('Error logs retrieved successfully', logData));
});

/** 
 * GENERAL SETTINGS 
 */

exports.getSettings = catchAsync(async (req, res) => {
    console.log('[SettingsController] Getting settings...');
    
    let settings = await Settings.findOne();
    
    if (!settings) {
        settings = await Settings.create({});
    }

    console.log('[SettingsController] Settings:', settings);

    return res.status(200).json({
        success: true,
        data: settings
    });
});

exports.updateSettings = catchAsync(async (req, res) => {
    const { general } = req.body;
    
    console.log('[SettingsController] Updating settings:', general);

    if (!general) {
        return res.status(400).json({
            success: false,
            message: 'No settings data provided'
        });
    }

    try {
        // Create update object without user reference first
        const updateData = {
            general,
            'lastUpdated.date': new Date()
        };

        const settings = await Settings.findOneAndUpdate(
            {},
            updateData,
            { 
                new: true, 
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        if (!settings) {
            throw new Error('Failed to update settings');
        }

        console.log('[SettingsController] Settings updated:', settings);

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error) {
        console.error('[SettingsController] Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update settings'
        });
    }
});

// POST /logo
exports.uploadLogo = catchAsync(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    try {
        await fs.access(req.file.path);
        
        // Simplify path to avoid double slashes
        const fileUrl = `uploads/logos/${req.file.filename}`;
        
        const settings = await Settings.findOneAndUpdate(
            {},
            { 
                'appearance.logo': fileUrl,
                'lastUpdated.by': req.user?._id,
                'lastUpdated.date': new Date()
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            data: {
                fileUrl,
                settings
            }
        });
    } catch (error) {
        // If there's an error, try to clean up the uploaded file
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting failed upload:', unlinkError);
            }
        }
        throw error;
    }
});

// DELETE /logo
exports.deleteLogo = catchAsync(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { logo: null },
    { new: true }
  );
  res.json(ApiResponse.success('Logo deleted successfully', settings));
});

/** 
 * USER MANAGEMENT 
 */

// GET /users
exports.getUsers = catchAsync(async (req, res) => {
  try {
    const { role } = req.query;
    const query = role && role !== 'all' ? { role } : {};

    const users = await User.find(query)
      .select('-password')
      .populate({
        path: 'profile',
        select: 'staffID enrollmentNumber department designation'
      })
      .sort({ createdAt: -1 });

    const enhancedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
      status: user.isActive ? 'active' : 'inactive',
      staffID: user.profile?.staffID,
      enrollmentNumber: user.profile?.enrollmentNumber,
      department: user.profile?.department,
      designation: user.profile?.designation
    }));

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: enhancedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  const { username, email, role, password } = req.body;
  const user = await User.create({
    username,
    email,
    role,
    password,
    createdBy: req.user._id
  });
  res.status(201).json(ApiResponse.success('User created successfully', user));
});

// PUT /users/:id
exports.updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  if (!user) {
    return res.status(404).json(ApiResponse.error('User not found'));
  }
  res.json(ApiResponse.success('User updated successfully', user));
});

// DELETE /users/:id
exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json(ApiResponse.error('User not found'));
  }
  res.json(ApiResponse.success('User deleted successfully'));
});

// PUT /users/:id/status
exports.updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., active/inactive
  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
  if (!user) {
    return res.status(404).json(ApiResponse.error('User not found'));
  }
  res.json(ApiResponse.success('User status updated successfully', user));
});

// PUT /users/:id/permissions
exports.updateUserPermissions = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body; // assumed to be an array or object of permissions
  const user = await User.findByIdAndUpdate(id, { permissions }, { new: true }).select('-password');
  if (!user) {
    return res.status(404).json(ApiResponse.error('User not found'));
  }
  res.json(ApiResponse.success('User permissions updated successfully', user));
});

/** 
 * TEMPLATE MANAGEMENT 
 */

// GET /templates
exports.getTemplates = catchAsync(async (req, res) => {
  const templates = await Template.find()
    .populate('createdBy', 'username')
    .sort('-createdAt');
  res.json(ApiResponse.success('Templates retrieved successfully', templates));
});

// GET /templates/:id
exports.getTemplateById = catchAsync(async (req, res) => {
  const template = await Template.findById(req.params.id).populate('createdBy', 'username');
  if (!template) {
    return res.status(404).json(ApiResponse.error('Template not found'));
  }
  res.json(ApiResponse.success('Template retrieved successfully', template));
});

// POST /templates
exports.createTemplate = catchAsync(async (req, res) => {
  const { name, type, description } = req.body;
  const templateImage = req.files?.find(f => f.fieldname === 'templateImage');
  const previewImage = req.files?.find(f => f.fieldname === 'previewImage');
  const template = await Template.create({
    name,
    type,
    description,
    templateImage: templateImage ? await uploadToStorage(templateImage, 'templates') : null,
    previewImage: previewImage ? await uploadToStorage(previewImage, 'previews') : null,
    createdBy: req.user._id
  });
  res.status(201).json(ApiResponse.success('Template created successfully', template));
});

// PUT /templates/:id
exports.updateTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const templateImage = req.files?.find(f => f.fieldname === 'templateImage');
  const previewImage = req.files?.find(f => f.fieldname === 'previewImage');
  if (templateImage) {
    updateData.templateImage = await uploadToStorage(templateImage, 'templates');
  }
  if (previewImage) {
    updateData.previewImage = await uploadToStorage(previewImage, 'previews');
  }
  const template = await Template.findByIdAndUpdate(id, updateData, { new: true });
  if (!template) {
    return res.status(404).json(ApiResponse.error('Template not found'));
  }
  res.json(ApiResponse.success('Template updated successfully', template));
});

// DELETE /templates/:id
exports.deleteTemplate = catchAsync(async (req, res) => {
  const template = await Template.findByIdAndDelete(req.params.id);
  if (!template) {
    return res.status(404).json(ApiResponse.error('Template not found'));
  }
  res.json(ApiResponse.success('Template deleted successfully'));
});

// POST /templates/:id/preview
exports.previewTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;
  // Implement preview generation logic here; returning a dummy URL for now.
  res.json(ApiResponse.success('Template preview generated successfully', {
    templateId: id,
    previewUrl: `https://example.com/preview/${id}`
  }));
});

// GET /templates/categories
exports.getTemplateCategories = catchAsync(async (req, res) => {
  // Example static categories. Adjust as needed.
  const categories = ['Invoice', 'Report', 'Certificate'];
  res.json(ApiResponse.success('Template categories retrieved successfully', categories));
});

/** 
 * SIGNATURE MANAGEMENT 
 */

// GET /signatures
exports.getSignatures = catchAsync(async (req, res) => {
  const signatures = await Signature.find()
    .populate('createdBy', 'username')
    .sort('title');
  res.json(ApiResponse.success('Signatures retrieved successfully', signatures));
});

// GET /signatures/:id
exports.getSignatureById = catchAsync(async (req, res) => {
  const signature = await Signature.findById(req.params.id).populate('createdBy', 'username');
  if (!signature) {
    return res.status(404).json(ApiResponse.error('Signature not found'));
  }
  res.json(ApiResponse.success('Signature retrieved successfully', signature));
});

// POST /signatures
exports.createSignature = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(ApiResponse.error('No signature image uploaded'));
  }
  const { title, name } = req.body;
  const imageUrl = await uploadToStorage(req.file, 'signatures');
  const signature = await Signature.create({
    title,
    name,
    imageUrl,
    createdBy: req.user._id
  });
  res.status(201).json(ApiResponse.success('Signature created successfully', signature));
});

// PUT /signatures/:id
exports.updateSignature = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  if (req.file) {
    updateData.imageUrl = await uploadToStorage(req.file, 'signatures');
  }
  const signature = await Signature.findByIdAndUpdate(id, updateData, { new: true });
  if (!signature) {
    return res.status(404).json(ApiResponse.error('Signature not found'));
  }
  res.json(ApiResponse.success('Signature updated successfully', signature));
});

// DELETE /signatures/:id
exports.deleteSignature = catchAsync(async (req, res) => {
  const signature = await Signature.findByIdAndDelete(req.params.id);
  if (!signature) {
    return res.status(404).json(ApiResponse.error('Signature not found'));
  }
  res.json(ApiResponse.success('Signature deleted successfully'));
});

exports.getSignatureRequirements = catchAsync(async (req, res) => {
  const allSignatures = await Signature.find({ status: 'active' });
  
  // Define required signatures for each document type
  const requirements = {
    TRANSFER_CERTIFICATE: ['PRINCIPAL', 'ADMIN_OFFICER'],
    REPORT_CARD: ['PRINCIPAL', 'CLASS_TEACHER'],
    // ... other document types ...
  };

  // Check which required signatures are missing
  const missing = Object.values(requirements)
    .flat()
    .filter(required => 
      !allSignatures.some(sig => sig.type === required)
    );

  res.json(ApiResponse.success('Signature requirements retrieved', {
    requirements,
    missing,
    available: allSignatures.map(sig => sig.type)
  }));
});

exports.verifySignatureRequirements = catchAsync(async (req, res) => {
  const { documentType } = req.params;
  const requiredSignatures = DOCUMENT_TYPES[documentType] || [];
  
  const availableSignatures = await Signature.find({
    type: { $in: requiredSignatures },
    status: 'active'
  });

  const missingSignatures = requiredSignatures.filter(
    required => !availableSignatures.some(sig => sig.type === required)
  );

  res.json(ApiResponse.success('Signature verification completed', {
    documentType,
    isComplete: missingSignatures.length === 0,
    missingSignatures,
    availableSignatures: availableSignatures.map(sig => sig.type)
  }));
});

exports.requestSignature = catchAsync(async (req, res) => {
  const { type } = req.body;
  
  // Create notification/email to relevant authority
  await Notification.create({
    type: 'SIGNATURE_REQUEST',
    title: `Signature Required: ${SIGNATURE_TYPES[type]?.label}`,
    message: `A signature is required for ${type}`,
    to: await User.findOne({ role: type.toLowerCase() }),
    from: req.user._id,
    status: 'pending'
  });

  res.json(ApiResponse.success('Signature request sent successfully'));
});

/** 
 * MESSAGE SETTINGS 
 */

// GET /messages/settings
exports.getMessageSettings = catchAsync(async (req, res) => {
  const settings = await Settings.findOne().lean();
  res.json(ApiResponse.success('Message settings retrieved successfully', settings.messages || {}));
});

// PUT /messages/settings
exports.updateMessageSettings = catchAsync(async (req, res) => {
  const updateData = req.body;
  const settings = await Settings.findOneAndUpdate(
    {},
    { messages: updateData, 'lastUpdated.messages': { by: req.user._id, date: new Date() } },
    { new: true, upsert: true }
  );
  res.json(ApiResponse.success('Message settings updated successfully', settings.messages));
});

// GET /messages/templates
exports.getMessageTemplates = catchAsync(async (req, res) => {
  // Example static message templates.
  const templates = [
    { id: 1, name: 'Welcome Message', content: 'Hello, welcome to our service!' },
    { id: 2, name: 'Password Reset', content: 'Click here to reset your password.' }
  ];
  res.json(ApiResponse.success('Message templates retrieved successfully', templates));
});

// POST /messages/templates/test
exports.testMessageTemplate = catchAsync(async (req, res) => {
  // Implement test logic for sending a message.
  res.json(ApiResponse.success('Test message template sent successfully'));
});

/** 
 * NOTIFICATION SETTINGS 
 */

// GET /notifications/settings
exports.getNotificationSettings = catchAsync(async (req, res) => {
  const settings = await Settings.findOne().lean();
  res.json(ApiResponse.success('Notification settings retrieved successfully', settings.notifications || {}));
});

// PUT /notifications/settings
exports.updateNotificationSettings = catchAsync(async (req, res) => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { notifications: req.body, 'lastUpdated.notifications': { by: req.user._id, date: new Date() } },
    { new: true }
  );
  res.json(ApiResponse.success('Notification settings updated successfully', settings));
});

// POST /notifications/test
exports.testNotification = catchAsync(async (req, res) => {
  await sendTestNotification(req.body);
  res.json(ApiResponse.success('Test notification sent successfully'));
});

// GET /notifications/logs
exports.getNotificationLogs = catchAsync(async (req, res) => {
  const logData = await fs.readFile('logs/notifications.log', 'utf8');
  res.json(ApiResponse.success('Notification logs retrieved successfully', logData));
});

/** 
 * BACKUP MANAGEMENT 
 */

// GET /backup/settings
exports.getBackupSettings = catchAsync(async (req, res) => {
  const settings = await Settings.findOne().lean();
  res.json(ApiResponse.success('Backup settings retrieved successfully', settings.backup || {}));
});

// PUT /backup/settings
exports.updateBackupSettings = catchAsync(async (req, res) => {
  const updateData = req.body;
  const settings = await Settings.findOneAndUpdate(
    {},
    { backup: updateData, 'backup.lastUpdated': { by: req.user._id, date: new Date() } },
    { new: true, upsert: true }
  );
  res.json(ApiResponse.success('Backup settings updated successfully', settings.backup));
});

// GET /backup/history
exports.getBackupHistory = catchAsync(async (req, res) => {
  const backups = await Backup.find()
    .populate('createdBy', 'username')
    .sort('-createdAt');
  res.json(ApiResponse.success('Backup history retrieved successfully', backups));
});

// POST /backup/create
exports.createBackup = catchAsync(async (req, res) => {
  const backupPath = await generateBackup();
  const backup = await Backup.create({
    path: backupPath,
    createdBy: req.user._id,
    type: 'manual'
  });
  res.json(ApiResponse.success('Backup created successfully', backup));
});

// POST /backup/restore/:backupId
exports.restoreFromBackup = catchAsync(async (req, res) => {
  const { backupId } = req.params;
  const backup = await Backup.findById(backupId);
  if (!backup) {
    return res.status(404).json(ApiResponse.error('Backup not found'));
  }
  await restoreBackup(backup.path);
  res.json(ApiResponse.success('Backup restored successfully'));
});

// DELETE /backup/:backupId
exports.deleteBackup = catchAsync(async (req, res) => {
  const { backupId } = req.params;
  const backup = await Backup.findByIdAndDelete(backupId);
  if (!backup) {
    return res.status(404).json(ApiResponse.error('Backup not found'));
  }
  // Optionally delete the backup file from storage.
  await deleteFile(backup.path);
  res.json(ApiResponse.success('Backup deleted successfully'));
});

// POST /backup/schedule
exports.scheduleBackup = catchAsync(async (req, res) => {
  const { scheduleTime } = req.body;
  await Settings.findOneAndUpdate(
    {},
    { 'backup.schedule': scheduleTime, 'backup.lastUpdated': { by: req.user._id, date: new Date() } },
    { new: true }
  );
  res.json(ApiResponse.success('Backup schedule updated successfully'));
});

// GET /backup/schedule
exports.getBackupSchedule = catchAsync(async (req, res) => {
  const settings = await Settings.findOne().lean();
  res.json(ApiResponse.success('Backup schedule retrieved successfully', settings.backup?.schedule));
});

/** 
 * SYSTEM SETTINGS 
 */

// GET /system/info
exports.getSystemInfo = catchAsync(async (req, res) => {
  const info = {
    platform: os.platform(),
    cpu: os.cpus()[0].model,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime()
  };
  res.json(ApiResponse.success('System information retrieved successfully', info));
});

// POST /system/cache/clear
exports.clearCache = catchAsync(async (req, res) => {
  // Implement your cache clearing logic here (e.g., clear Redis or in-memory caches)
  res.json(ApiResponse.success('Cache cleared successfully'));
});

// POST /system/maintenance
exports.toggleMaintenanceMode = catchAsync(async (req, res) => {
  const { mode } = req.body; // expecting a boolean value
  const settings = await Settings.findOneAndUpdate(
    {},
    { maintenanceMode: mode, 'lastUpdated.maintenance': { by: req.user._id, date: new Date() } },
    { new: true, upsert: true }
  );
  res.json(ApiResponse.success('Maintenance mode updated successfully', { maintenanceMode: settings.maintenanceMode }));
});

exports.updateTheme = catchAsync(async (req, res) => {
  const { themeColor } = req.body;
  
  if (!themeColor) {
    return res.status(400).json(ApiResponse.error('Theme color is required'));
  }

  const settings = await Settings.findOneAndUpdate(
    {},
    {
      'appearance.themeColor': themeColor,
      'lastUpdated.by': req.user?._id,
      'lastUpdated.date': new Date()
    },
    { new: true, upsert: true }
  );

  res.json(ApiResponse.success('Theme updated successfully', settings));
});

exports.updateAdvancedSettings = catchAsync(async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'No settings data provided'
      });
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      {
        'advanced': req.body,
        'lastUpdated.by': req.user?._id,
        'lastUpdated.date': new Date()
      },
      { new: true, upsert: true }
    );

    if (!updatedSettings) {
      throw new Error('Failed to update advanced settings');
    }

    res.json({
      success: true,
      message: 'Advanced settings updated successfully',
      data: updatedSettings.advanced
    });
  } catch (error) {
    console.error('Advanced settings update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update advanced settings'
    });
  }
});

module.exports = exports;
