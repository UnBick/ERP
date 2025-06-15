const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./validationUtils');

exports.validateLeaveRequest = [
  param('studentId')
    .isMongoId()
    .withMessage('Invalid student ID'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  
  handleValidationErrors
];
