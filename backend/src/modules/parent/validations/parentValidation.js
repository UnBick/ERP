const Joi = require('joi');

const parentValidation = {
    // Profile Validations
    updateProfile: Joi.object({
        name: Joi.string().min(3).max(100).required(),
        email: Joi.string().email().required(),
        phoneNumber: Joi.string().pattern(/^[0-9+\-\s]+$/),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            postalCode: Joi.string(),
            country: Joi.string()
        }),
        occupation: Joi.string(),
        emergencyContact: Joi.object({
            name: Joi.string(),
            relationship: Joi.string(),
            phone: Joi.string().pattern(/^[0-9+\-\s]+$/),
            email: Joi.string().email()
        })
    }),

    // Settings Validations
    updatePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
                'string.min': 'Password must be at least 8 characters long'
            }),
        confirmPassword: Joi.ref('newPassword')
    }),

    updateNotificationSettings: Joi.object({
        email: Joi.object({
            enabled: Joi.boolean(),
            frequency: Joi.string().valid('instant', 'daily', 'weekly'),
            types: Joi.object({
                attendance: Joi.boolean(),
                grades: Joi.boolean(),
                homework: Joi.boolean(),
                events: Joi.boolean(),
                announcements: Joi.boolean()
            })
        }),
        sms: Joi.object({
            enabled: Joi.boolean(),
            types: Joi.object({
                attendance: Joi.boolean(),
                emergencies: Joi.boolean()
            })
        }),
        app: Joi.object({
            enabled: Joi.boolean(),
            types: Joi.object({
                attendance: Joi.boolean(),
                grades: Joi.boolean(),
                homework: Joi.boolean(),
                events: Joi.boolean(),
                announcements: Joi.boolean(),
                chat: Joi.boolean()
            })
        })
    }),

    // Attendance Validations
    leaveRequest: Joi.object({
        startDate: Joi.date().greater('now').required(),
        endDate: Joi.date().greater(Joi.ref('startDate')).required(),
        reason: Joi.string().min(10).required(),
        type: Joi.string().valid('sick', 'personal', 'family', 'other').required(),
        documents: Joi.array().items(Joi.string())
    }),

    // Student Progress Validations
    getProgress: Joi.object({
        studentId: Joi.string().hex().length(24).required(),
        examType: Joi.string().valid('term', 'unit', 'final'),
        subject: Joi.string().hex().length(24),
        fromDate: Joi.date(),
        toDate: Joi.date().min(Joi.ref('fromDate'))
    }),

    // Timetable Validations
    getTimetable: Joi.object({
        studentId: Joi.string().hex().length(24).required(),
        week: Joi.date(),
        subject: Joi.string().hex().length(24)
    }),

    // Fee Validations
    getFeeDetails: Joi.object({
        studentId: Joi.string().hex().length(24).required(),
        academicYear: Joi.string(),
        term: Joi.string(),
        status: Joi.string().valid('paid', 'pending', 'overdue')
    }),

    // Dashboard Validations
    dashboardFilters: Joi.object({
        timeRange: Joi.string().valid('today', 'week', 'month', 'term').default('week'),
        studentId: Joi.string().hex().length(24)
    }),

    // Communication Validations
    sendMessage: Joi.object({
        recipientId: Joi.string().hex().length(24).required(),
        subject: Joi.string().min(3).max(100).required(),
        message: Joi.string().min(10).required(),
        priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
        attachments: Joi.array().items(Joi.string())
    }),

    // Common Validations
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sortBy: Joi.string(),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }),

    idParam: Joi.object({
        id: Joi.string().hex().length(24).required()
    }),

    dateRange: Joi.object({
        startDate: Joi.date().required(),
        endDate: Joi.date().min(Joi.ref('startDate')).required()
    })
};

module.exports = parentValidation;