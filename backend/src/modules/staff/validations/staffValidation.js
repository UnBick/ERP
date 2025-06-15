const Joi = require('joi');

const staffValidation = {
    // Query Validations
    getStaffQuery: Joi.object({
        search: Joi.string(),
        department: Joi.string(),
        role: Joi.string(),
        status: Joi.string().valid('active', 'inactive', 'onLeave', 'terminated'),
        page: Joi.number().min(1),
        limit: Joi.number().min(1).max(100),
        sortBy: Joi.string(),
        sortOrder: Joi.number().valid(1, -1)
    }),

    idParam: Joi.object({
        id: Joi.string().required().hex().length(24)
    }),

    // Staff Basic Operations
    createStaff: Joi.object({
        personalInfo: Joi.object({
            firstName: Joi.string().required().min(2).max(50),
            lastName: Joi.string().required().min(2).max(50),
            email: Joi.string().required().email(),
            phone: Joi.string().pattern(/^[0-9+\-\s]+$/),
            dateOfBirth: Joi.date().max('now'),
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
                phone: Joi.string().pattern(/^[0-9+\-\s]+$/)
            })
        }).required(),

        professionalInfo: Joi.object({
            department: Joi.string().required(),
            role: Joi.string().required(),
            joiningDate: Joi.date().required(),
            qualification: Joi.string(),
            experience: Joi.number().min(0),
            contractType: Joi.string().valid('permanent', 'contract', 'temporary'),
            salary: Joi.object({
                basic: Joi.number().required(),
                allowances: Joi.object(),
                deductions: Joi.object()
            })
        }).required()
    }),

    updateStaff: Joi.object({
        personalInfo: Joi.object({
            firstName: Joi.string().min(2).max(50),
            lastName: Joi.string().min(2).max(50),
            email: Joi.string().email(),
            phone: Joi.string().pattern(/^[0-9+\-\s]+$/),
            dateOfBirth: Joi.date().max('now'),
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
                phone: Joi.string().pattern(/^[0-9+\-\s]+$/)
            })
        }),

        professionalInfo: Joi.object({
            department: Joi.string(),
            role: Joi.string(),
            qualification: Joi.string(),
            experience: Joi.number().min(0),
            contractType: Joi.string().valid('permanent', 'contract', 'temporary'),
            salary: Joi.object({
                basic: Joi.number(),
                allowances: Joi.object(),
                deductions: Joi.object()
            })
        })
    }),

    // Attendance Validations
    markAttendance: Joi.object({
        staffId: Joi.string().required().hex().length(24),
        date: Joi.date().required().max('now'),
        status: Joi.string().required().valid('present', 'absent', 'late'),
        biometricData: Joi.object({
            scanTime: Joi.date(),
            deviceId: Joi.string(),
            verificationStatus: Joi.string().valid('verified', 'failed', 'pending')
        })
    }),

    getAttendance: Joi.object({
        staffId: Joi.string().required().hex().length(24),
        startDate: Joi.date(),
        endDate: Joi.date().min(Joi.ref('startDate'))
    }),

    // Leave Validations
    applyLeave: Joi.object({
        staffId: Joi.string().required().hex().length(24),
        leaveType: Joi.string().required().valid(
            'Sick Leave', 
            'Casual Leave', 
            'Maternity Leave', 
            'Paternity Leave', 
            'Unpaid Leave'
        ),
        startDate: Joi.date().required().min('now'),
        endDate: Joi.date().required().min(Joi.ref('startDate')),
        reason: Joi.string().required().min(10),
        documents: Joi.array().items(Joi.binary())
    }),

    updateLeave: Joi.object({
        status: Joi.string().required().valid('approved', 'rejected', 'cancelled'),
        comments: Joi.string()
    }),

    // Document Validations
    uploadDocuments: Joi.object({
        category: Joi.string().required().valid(
            'identification',
            'qualification',
            'contract',
            'other'
        ),
        metadata: Joi.object({
            documentNumber: Joi.string(),
            issueDate: Joi.date(),
            expiryDate: Joi.date().min('now'),
            issuingAuthority: Joi.string()
        })
    }),

    // Transport Validations
    assignTransport: Joi.object({
        routeId: Joi.string().required().hex().length(24),
        pickup: Joi.string().required(),
        drop: Joi.string().required()
    }),

    // Library Validations
    issueBook: Joi.object({
        bookId: Joi.string().required().hex().length(24),
        dueDate: Joi.date().required().min('now')
    }),

    returnBook: Joi.object({
        bookId: Joi.string().required().hex().length(24)
    })
};

module.exports = staffValidation;