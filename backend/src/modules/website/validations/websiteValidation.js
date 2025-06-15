const { body, query, param } = require('express-validator');
const { handleValidationErrors } = require('../../../middleware/validation/validationUtils');

// Theme Validations
exports.updateTheme = [
    body('colors').isObject().notEmpty(),
    body('fonts').isObject().notEmpty(),
    body('spacing').isObject().notEmpty(),
    body('borderRadius').isObject().notEmpty(),
    body('shadows').isObject().notEmpty(),
    body('name').isString().trim().notEmpty(),
    handleValidationErrors
];

exports.saveThemePreset = [
    body('name').isString().trim().notEmpty(),
    body('theme').isObject().notEmpty(),
    handleValidationErrors
];

// Website Settings Validations
exports.updateSettings = [
    body('siteTitle').isString().trim().notEmpty(),
    body('description').optional().isString(),
    body('keywords').optional().isArray(),
    body('analytics.googleAnalyticsId').optional().isString(),
    body('social').optional().isObject(),
    handleValidationErrors
];

// Homepage Validations
exports.updateHero = [
    body('title').isString().trim().notEmpty(),
    body('subtitle').optional().isString(),
    body('backgroundType').isIn(['image', 'video', 'slider']),
    body('backgroundUrl').isString().notEmpty(),
    body('buttons').optional().isArray(),
    body('overlay').optional().isObject(),
    handleValidationErrors
];

exports.updateNotice = [
    body('title').isString().trim().notEmpty(),
    body('content').isString().notEmpty(),
    body('type').isIn(['general', 'academic', 'event', 'urgent']),
    body('priority').optional().isInt({ min: 0, max: 10 }),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    handleValidationErrors
];

exports.updateGallery = [
    body('images').isArray(),
    body('settings.autoplay').optional().isBoolean(),
    body('settings.delay').optional().isInt({ min: 1000 }),
    body('settings.layout').optional().isString(),
    handleValidationErrors
];

// About Section Validations
exports.updateAboutContent = [
    body('sections').isArray(),
    body('sections.*.title').isString().notEmpty(),
    body('sections.*.content').isString().notEmpty(),
    body('stats').optional().isObject(),
    body('milestones').optional().isArray(),
    handleValidationErrors
];

exports.updatePrincipalMessage = [
    body('name').isString().trim().notEmpty(),
    body('title').isString().trim().notEmpty(),
    body('qualifications').isArray(),
    body('message').isString().notEmpty(),
    handleValidationErrors
];

exports.updatePhilosophyMission = [
    body('vision').isObject().notEmpty(),
    body('mission').isObject().notEmpty(),
    body('coreValues').isArray(),
    handleValidationErrors
];

// Academic Section Validations
exports.updateCurriculum = [
    body('section').isIn(['primary', 'middle', 'secondary', 'senior-secondary']),
    body('subjects').isArray(),
    body('features').optional().isArray(),
    body('methodology').optional().isArray(),
    handleValidationErrors
];

exports.uploadSyllabus = [
    body('title').isString().trim().notEmpty(),
    body('subject').isMongoId(),
    body('description').optional().isString(),
    handleValidationErrors
];

// Activities Validations
exports.createActivity = [
    body('title').isString().trim().notEmpty(),
    body('description').isString(),
    body('type').isIn(['cultural', 'sports', 'academic', 'social', 'other']),
    body('date').isISO8601(),
    body('venue').optional().isString(),
    handleValidationErrors
];

// Gallery Validations
exports.createAlbum = [
    body('title').isString().trim().notEmpty(),
    body('description').optional().isString(),
    body('category').isIn(['events', 'campus', 'activities', 'sports', 'other']),
    handleValidationErrors
];

exports.uploadMedia = [
    body('albumId').isMongoId(),
    body('title').isString().trim().notEmpty(),
    handleValidationErrors
];

// Events Validations
exports.createEvent = [
    body('title').isString().trim().notEmpty(),
    body('description').isString().notEmpty(),
    body('type').isIn(['academic', 'cultural', 'sports', 'workshop', 'other']),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('venue').isObject(),
    handleValidationErrors
];

exports.createCalendarEvent = [
    body('title').isString().trim().notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('type').isIn(['academic', 'holiday', 'exam', 'event', 'other']),
    handleValidationErrors
];

// Query Validations
exports.validateGalleryQuery = [
    query('category')
        .optional()
        .isIn(['events', 'campus', 'activities', 'sports'])
        .withMessage('Invalid gallery category'),
    handleValidationErrors
];

exports.validateEventsQuery = [
    query('month')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('Invalid month'),
    query('year')
        .optional()
        .isInt({ min: 2000, max: 2100 })
        .withMessage('Invalid year'),
    handleValidationErrors
];

// Parameter Validations
exports.validateIdParam = [
    param('id').isMongoId().withMessage('Invalid ID format'),
    handleValidationErrors
];

module.exports = exports;