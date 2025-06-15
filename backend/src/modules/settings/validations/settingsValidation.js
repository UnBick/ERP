const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../../middleware/validation/validationUtils');

// General Settings Validation
exports.updateSettings = [
    body('schoolName').trim().notEmpty().withMessage('School name is required'),
    body('address').optional().trim(),
    body('phoneNumber').optional()
        .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number format'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    body('themeColor').optional().isHexColor().withMessage('Invalid color format'),
    handleValidationErrors
];

// User Management Validation
exports.createUser = [
    body('username').trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('password').trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
        .withMessage('Password must contain at least one letter and one number'),
    body('role').isIn(['admin', 'teacher', 'staff', 'webmaster'])
        .withMessage('Invalid role'),
    handleValidationErrors
];

exports.updateUser = [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('username').optional().trim()
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').optional().trim().isEmail().withMessage('Invalid email format'),
    body('role').optional()
        .isIn(['admin', 'teacher', 'staff', 'webmaster'])
        .withMessage('Invalid role'),
    handleValidationErrors
];

exports.updateUserStatus = [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('status').isIn(['active', 'inactive', 'blocked'])
        .withMessage('Invalid status'),
    handleValidationErrors
];

// Template Management Validation
exports.createTemplate = [
    body('name').trim().notEmpty().withMessage('Template name is required'),
    body('type').isIn(['email', 'document', 'report'])
        .withMessage('Invalid template type'),
    body('content').notEmpty().withMessage('Template content is required'),
    body('variables').optional().isArray(),
    body('variables.*.name').optional().isString(),
    body('variables.*.description').optional().isString(),
    handleValidationErrors
];

exports.updateTemplate = [
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('name').optional().trim(),
    body('content').optional().notEmpty(),
    body('variables').optional().isArray(),
    handleValidationErrors
];

// Signature Management Validation
exports.createSignature = [
    body('title').trim().notEmpty().withMessage('Signature title is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').isIn(['administrative', 'academic', 'staff'])
        .withMessage('Invalid signature type'),
    handleValidationErrors
];

// Notification Settings Validation
exports.updateNotificationSettings = [
    body('email.enabled').isBoolean(),
    body('email.provider').optional().isString(),
    body('email.apiKey').optional().isString(),
    body('sms.enabled').isBoolean(),
    body('sms.provider').optional().isString(),
    body('sms.apiKey').optional().isString(),
    body('push.enabled').isBoolean(),
    handleValidationErrors
];

exports.testNotification = [
    body('type').isIn(['email', 'sms', 'push'])
        .withMessage('Invalid notification type'),
    body('recipient').notEmpty().withMessage('Recipient is required'),
    body('template').optional().isString(),
    handleValidationErrors
];

// Message Settings Validation
exports.updateMessageSettings = [
    body('defaultLanguage').isString(),
    body('templates').optional().isArray(),
    body('templates.*').optional().isMongoId(),
    handleValidationErrors
];

// Backup Settings Validation
exports.updateBackupSettings = [
    body('schedule.frequency').isIn(['daily', 'weekly', 'monthly']),
    body('schedule.time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Invalid time format (HH:mm)'),
    body('storage.type').isIn(['local', 'cloud']),
    body('storage.path').optional().isString(),
    handleValidationErrors
];

exports.validateBackupId = [
    param('backupId').isMongoId().withMessage('Invalid backup ID'),
    handleValidationErrors
];

exports.scheduleBackup = [
    body('frequency').isIn(['daily', 'weekly', 'monthly'])
        .withMessage('Invalid frequency'),
    body('time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Invalid time format (HH:mm)'),
    body('retention').optional().isInt({ min: 1 })
        .withMessage('Retention must be at least 1 day'),
    handleValidationErrors
];

// System Settings Validation
exports.updateMaintenanceMode = [
    body('enabled').isBoolean(),
    body('message').optional().isString(),
    body('scheduledEnd').optional().isISO8601(),
    handleValidationErrors
];

module.exports = exports;