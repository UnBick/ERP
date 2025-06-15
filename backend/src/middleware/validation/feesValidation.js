const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./validationUtils');

exports.validateFees = [
  body('className').notEmpty().withMessage('Class name is required'),
  body('feeTypes').isArray().withMessage('Fee types must be an array'),
  body('feeTypes.*.type').notEmpty().withMessage('Fee type is required'),
  body('feeTypes.*.amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount cannot be negative'),
  handleValidationErrors
];

exports.validatePayment = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount cannot be negative'),
  body('paymentMode')
    .isIn(['cash', 'online', 'cheque', 'bank_transfer'])
    .withMessage('Invalid payment mode'),
  handleValidationErrors
];

// Add this validation middleware
exports.validateFeeStructure = [
  param('id').notEmpty().withMessage('Fee structure ID is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  handleValidationErrors
];
