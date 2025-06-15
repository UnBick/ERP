const { query } = require('express-validator');
const { handleValidationErrors } = require('./validationUtils');

exports.validateReportQuery = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Invalid year'),
  
  query('format')
    .optional()
    .isIn(['pdf', 'excel', 'csv'])
    .withMessage('Invalid format type'),
  
  handleValidationErrors
];
