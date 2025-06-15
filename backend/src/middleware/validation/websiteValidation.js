const { query } = require('express-validator');
const { handleValidationErrors } = require('./validationUtils');

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
