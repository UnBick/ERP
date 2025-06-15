const { body } = require('express-validator');
const { handleValidationErrors } = require('./validationUtils');

exports.validateUser = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Invalid email format'),
  
  body('role')
    .isIn(['admin', 'teacher', 'student', 'parent', 'staff'])
    .withMessage('Invalid role'),
  
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

exports.validatePermissions = [
  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array'),
  
  body('permissions.*')
    .isString()
    .withMessage('Each permission must be a string'),
  
  handleValidationErrors
];
