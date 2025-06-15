const { body } = require('express-validator');

exports.facilityValidation = [
  body('type')
    .isIn(['classrooms', 'labs', 'library', 'sports'])
    .withMessage('Invalid facility type'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title must not exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50, max: 500 })
    .withMessage('Description must be between 50 and 500 characters'),
  
  body('staffInCharge')
    .optional()
    .isMongoId()
    .withMessage('Invalid staff ID'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive number')
];
