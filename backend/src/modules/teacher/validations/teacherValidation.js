const Joi = require('joi');

const teacherValidation = {
    // Student Grading Validation
    getStudentsForGrading: {
        query: Joi.object({
            classId: Joi.string().required().messages({
                'string.empty': 'Class ID is required',
                'any.required': 'Class ID is required'
            }),
            sectionId: Joi.string().required().messages({
                'string.empty': 'Section ID is required',
                'any.required': 'Section ID is required'
            })
        }).unknown(true)
    },

    // Attendance Validations
    markSelfAttendance: Joi.object({
        location: Joi.object({
            type: Joi.string().valid('Point').default('Point'),
            coordinates: Joi.array().items(Joi.number()).length(2)
        }),
        timestamp: Joi.date().default(Date.now)
    }),

    getAttendanceHistory: Joi.object({
        startDate: Joi.date(),
        endDate: Joi.date().min(Joi.ref('startDate'))
    }),

    markStudentAttendance: Joi.object({
        studentId: Joi.string().required().hex().length(24),
        date: Joi.date().default(Date.now),
        status: Joi.string().valid('present', 'absent', 'late').required()
    }),

    requestLeave: Joi.object({
        startDate: Joi.date().required().min('now'),
        endDate: Joi.date().required().min(Joi.ref('startDate')),
        type: Joi.string().valid('sick', 'casual', 'annual', 'other').required(),
        reason: Joi.string().required().min(10)
    }),

    // Schedule Validations
    getSchedule: Joi.object({
        selectedClass: Joi.string().hex().length(24),
        week: Joi.date()
    }),

    requestSubstitute: Joi.object({
        classId: Joi.string().required().hex().length(24),
        date: Joi.date().required().min('now'),
        reason: Joi.string().required().min(10),
        timeSlot: Joi.object({
            start: Joi.string().required(),
            end: Joi.string().required()
        })
    }),

    addScheduleNote: Joi.object({
        classId: Joi.string().required().hex().length(24),
        date: Joi.date().required(),
        note: Joi.string().required(),
        type: Joi.string().valid('reminder', 'assignment', 'exam', 'other'),
        priority: Joi.string().valid('low', 'medium', 'high')
    }),

    // Grading Validations
    submitGrades: Joi.object({
        examType: Joi.string().required().hex().length(24),
        examDate: Joi.date().required(),
        subject: Joi.string().required().hex().length(24),
        maxMarks: Joi.number().required().min(0),
        grades: Joi.object().pattern(
            Joi.string().hex().length(24),
            Joi.number().min(0).max(Joi.ref('/maxMarks'))
        ).required(),
        autoPublish: Joi.boolean().default(false)
    }),

    uploadGrades: Joi.object({
        examType: Joi.string().required().hex().length(24),
        subject: Joi.string().required().hex().length(24),
        examDate: Joi.date().required(),
        grades: Joi.array().items(
            Joi.object({
                studentId: Joi.string().required().hex().length(24),
                marks: Joi.number().required().min(0),
                maxMarks: Joi.number().required().min(0),
                comments: Joi.string()
            })
        )
    }),

    // Report Validations
    generateReport: Joi.object({
        type: Joi.string().required().valid('academic', 'attendance', 'behavior'),
        dateRange: Joi.object({
            start: Joi.date().required(),
            end: Joi.date().required().min(Joi.ref('start'))
        }),
        filters: Joi.object({
            class: Joi.string().required().hex().length(24),
            section: Joi.string().required().hex().length(24),
            subject: Joi.string().hex().length(24),
            format: Joi.string().valid('pdf', 'excel', 'csv').default('pdf')
        })
    }),

    // Settings Validations
    updateProfile: Joi.object({
        personalInfo: Joi.object({
            firstName: Joi.string().min(2).max(50),
            lastName: Joi.string().min(2).max(50),
            phone: Joi.string().pattern(/^[0-9+\-\s]+$/),
            dateOfBirth: Joi.date(),
            gender: Joi.string().valid('male', 'female', 'other'),
            address: Joi.object({
                street: Joi.string(),
                city: Joi.string(),
                state: Joi.string(),
                postalCode: Joi.string(),
                country: Joi.string()
            }),
            emergencyContact: Joi.object({
                name: Joi.string(),
                relationship: Joi.string(),
                phone: Joi.string().pattern(/^[0-9+\-\s]+$/),
                email: Joi.string().email()
            })
        }),
        qualifications: Joi.array().items(
            Joi.object({
                degree: Joi.string().required(),
                institution: Joi.string().required(),
                year: Joi.number().integer().min(1950).max(new Date().getFullYear()),
                specialization: Joi.string()
            })
        )
    }),

    updatePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .required(),
        confirmPassword: Joi.ref('newPassword')
    }),

    // Dashboard Validations
    getDashboardData: Joi.object({
        timeRange: Joi.string().valid('day', 'week', 'month').default('day')
    }),

    // Common Validations
    idParam: Joi.object({
        id: Joi.string().required().hex().length(24)
    }),

    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sortBy: Joi.string(),
        order: Joi.string().valid('asc', 'desc').default('desc')
    })
};

module.exports = teacherValidation;