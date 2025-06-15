const { body, param, query, validationResult } = require('express-validator');

exports.curriculumValidation = [
  body('section')
    .isIn(['primary', 'middle', 'secondary', 'senior'])
    .withMessage('Invalid section'),
  body('title').trim().notEmpty()
    .withMessage('Title is required'),
  body('subjects.*.name').trim().notEmpty()
    .withMessage('Subject name is required'),
  body('subjects.*.topics').isArray()
    .withMessage('Topics must be an array')
];

exports.activityValidation = [
  body('type')
    .isIn(['sports', 'cultural', 'clubs', 'workshops', 'assemblies'])
    .withMessage('Invalid activity type'),
  body('title').trim().notEmpty()
    .withMessage('Title is required'),
  body('date').isISO8601()
    .withMessage('Invalid date format')
];

exports.validateAcademicRequest = [
  param('section')
    .isIn(['primary', 'middle', 'secondary', 'senior'])
    .withMessage('Invalid section'),

  body('subjects.*.name')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required'),

  body('subjects.*.description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Subject description must be at least 10 characters'),

  body('outcomes')
    .optional()
    .isArray()
    .withMessage('Outcomes must be an array')
];

exports.validateScholarBadge = [
  body('criteria.academicScore')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Academic score must be between 0 and 100'),

  body('criteria.attendance')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Attendance must be between 0 and 100'),

  body('student')
    .isMongoId()
    .withMessage('Invalid student ID')
];

exports.validateAcademicYear = [
  body('year').isString().notEmpty().withMessage('Academic year is required'),
  body('terms').isArray().withMessage('Terms must be an array'),
  body('startDate').isDate().withMessage('Valid start date is required'),
  body('endDate').isDate().withMessage('Valid end date is required'),
  handleValidationErrors
];

exports.validateCurriculum = [
  param('classId').isInt().withMessage('Valid class ID is required'),
  body('subjects').isArray().withMessage('Subjects must be an array'),
  body('subjects.*.name').isString().notEmpty().withMessage('Subject name is required'),
  body('subjects.*.hoursPerWeek').isInt().withMessage('Hours per week must be a number'),
  handleValidationErrors
];

exports.validateClass = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Class name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Class name must be between 2 and 50 characters'),

  body('level')
    .trim()
    .notEmpty()
    .withMessage('Academic level is required')
    .isIn(['Primary', 'Middle', 'Secondary', 'Senior Secondary'])
    .withMessage('Invalid academic level'),

  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('Academic year is required')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Academic year must be in format YYYY-YY'),

  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('classTeacher')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Class teacher name cannot exceed 100 characters'),

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

exports.validateSection = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Section name is required')
    .isLength({ min: 1, max: 10 })
    .withMessage('Section name must be between 1 and 10 characters'),
  
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),

  handleValidationErrors
];

exports.validateSubject = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Subject name must be between 2 and 50 characters'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Subject code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Subject code must be between 2 and 10 characters'),

  handleValidationErrors
];

exports.validateSyllabus = [
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),

  body('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Syllabus content is required')
    .isLength({ max: 5000 })
    .withMessage('Syllabus content cannot exceed 5000 characters'),

  handleValidationErrors
];

exports.validateTimetable = [
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .isMongoId()
    .withMessage('Invalid class ID'),

  body('sectionId')
    .notEmpty()
    .withMessage('Section ID is required')
    .isMongoId()
    .withMessage('Invalid section ID'),

  body('subjectId')
    .notEmpty()
    .withMessage('Subject ID is required')
    .isMongoId()
    .withMessage('Invalid subject ID'),

  body('day')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    .withMessage('Invalid day'),

  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),

  handleValidationErrors
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
}
