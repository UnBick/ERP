const { body } = require('express-validator');
const { handleValidationErrors } = require('../../../middleware/validation/validationUtils');

exports.validateExpense = [
  body('category')
    .isIn(['utilities', 'supplies', 'maintenance', 'salary', 'other'])
    .withMessage('Invalid expense category'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('description')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Description must be between 3 and 200 characters'),
  
  body('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  handleValidationErrors
];
