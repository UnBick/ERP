const { body } = require('express-validator');
const { handleValidationErrors } = require('./validationUtils');

exports.validatePayroll = [
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Invalid year'),
  body('employeeId')
    .optional()
    .isMongoId()
    .withMessage('Invalid employee ID'),
  handleValidationErrors
];
