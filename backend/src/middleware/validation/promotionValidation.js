const { body, validationResult } = require('express-validator');

exports.validatePromotion = [
  body('promotions').isArray().withMessage('Promotions must be an array'),
  body('promotions.*.studentId').isMongoId().withMessage('Invalid student ID'),
  body('promotions.*.nextClass').isInt({ min: 1, max: 12 }).withMessage('Invalid class'),
  body('promotions.*.nextSection').notEmpty().withMessage('Section is required'),
  body('promotions.*.status').isIn(['promote', 'detain', 'pending']).withMessage('Invalid status'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
