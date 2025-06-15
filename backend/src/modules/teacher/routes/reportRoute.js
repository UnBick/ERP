const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const reportValidation = require('../validations/teacherValidation');
const reportController = require('../controller/reportsController');

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(checkRole(['teacher']));

// Get all reports
router.get('/',
    reportController.getAllReports
);

// Generate different types of reports
router.post('/generate',
    validate(reportValidation.generateReport),
    reportController.generateReport
);

// Generate complete report card
router.get('/report-card/:classId/:sectionId/:studentId',
    validate(reportValidation.reportCardParams),
    reportController.generateCompleteReportCard
);

// Required validation schema (to be created in a separate file)
const reportValidation = {
    generateReport: Joi.object({
        type: Joi.string()
            .required()
            .valid('academic', 'attendance', 'behavior'),
        dateRange: Joi.object({
            start: Joi.date().required(),
            end: Joi.date().required().min(Joi.ref('start'))
        }).required(),
        filters: Joi.object({
            class: Joi.string().required().hex().length(24),
            section: Joi.string().required().hex().length(24),
            subject: Joi.string().hex().length(24),
            format: Joi.string().valid('pdf', 'excel', 'csv')
        }).required()
    }),

    reportCardParams: Joi.object({
        classId: Joi.string().required().hex().length(24),
        sectionId: Joi.string().required().hex().length(24),
        studentId: Joi.string().required().hex().length(24)
    })
};

module.exports = router;