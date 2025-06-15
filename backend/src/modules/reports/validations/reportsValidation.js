const Joi = require('joi');

const reportsValidation = {
    // Common validation for getting reports
    getReports: Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().required().min(Joi.ref('startDate')),
        class: Joi.string().hex().length(24),
        section: Joi.string().hex().length(24),
        subject: Joi.string().hex().length(24),
        format: Joi.string().valid('pdf', 'csv', 'excel')
    }),

    // Student Report Validations
    generateStudentReport: Joi.object({
        class: Joi.string().required().hex().length(24),
        section: Joi.string().hex().length(24),
        student: Joi.string().hex().length(24),
        reportPeriod: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().required().min(Joi.ref('startDate'))
        }),
        includeAttendance: Joi.boolean().default(true),
        includeExams: Joi.boolean().default(true),
        format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf')
    }),

    // Exam Report Validations
    generateExamReport: Joi.object({
        class: Joi.string().required().hex().length(24),
        section: Joi.string().hex().length(24),
        subject: Joi.string().hex().length(24),
        examType: Joi.string().valid('unit_test', 'midterm', 'final'),
        reportPeriod: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().required().min(Joi.ref('startDate'))
        }),
        format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf')
    }),

    // Attendance Report Validations
    generateAttendanceReport: Joi.object({
        class: Joi.string().required().hex().length(24),
        section: Joi.string().hex().length(24),
        scope: Joi.string().valid('class', 'section', 'individual'),
        reportPeriod: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().required().min(Joi.ref('startDate'))
        }),
        format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf')
    }),

    // Finance Report Validations
    generateFinanceReport: Joi.object({
        reportType: Joi.string().required().valid('Income', 'Expenditure', 'Fee Collection'),
        category: Joi.string(),
        reportPeriod: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().required().min(Joi.ref('startDate'))
        }),
        format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf')
    }),

    // Payroll Report Validations
    generatePayrollReport: Joi.object({
        department: Joi.string().hex().length(24),
        month: Joi.string().required().valid(
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ),
        year: Joi.number().required().min(2000).max(2100),
        format: Joi.string().valid('pdf', 'csv', 'excel').default('pdf')
    }),

    // Download Report Validation
    downloadReport: Joi.object({
        id: Joi.string().required().hex().length(24),
        type: Joi.string().required().valid(
            'student', 'exam', 'attendance', 'finance', 'payroll'
        )
    }),

    // Preview Report Validation
    previewReport: Joi.object({
        id: Joi.string().required().hex().length(24)
    }),

    // Delete Report Validation
    deleteReport: Joi.object({
        id: Joi.string().required().hex().length(24)
    }),

    // Archive Report Validation
    archiveReport: Joi.object({
        id: Joi.string().required().hex().length(24)
    }),

    // Share Report Validation
    shareReport: Joi.object({
        id: Joi.string().required().hex().length(24),
        recipients: Joi.array().items(
            Joi.string().email()
        ).min(1).required(),
        message: Joi.string().max(500)
    })
};

module.exports = reportsValidation;