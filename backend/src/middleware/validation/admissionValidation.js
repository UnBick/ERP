const { body } = require('express-validator');
const { handleValidationErrors } = require('./validationUtils');

exports.validateAdmission = [
  // Student details
  body('studentDetails.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('studentDetails.dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date of birth'),
  
  body('studentDetails.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),

  // Parent details
  body('parentDetails.fatherName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Father name must be between 2 and 50 characters'),
  
  body('parentDetails.motherName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Mother name must be between 2 and 50 characters'),
  
  body('parentDetails.contact')
    .matches(/^\+?[\d\s-]+$/)
    .withMessage('Invalid contact number'),

  // Academic details
  body('academicDetails.applyingForClass')
    .isInt({ min: 1, max: 12 })
    .withMessage('Invalid class selection'),
  
  body('academicDetails.previousSchool')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Previous school name too long'),

  handleValidationErrors
];
