const Joi = require('joi');

const studentValidation = {
    // Student Profile Validation
    createStudent: {
        body: Joi.object({
            name: Joi.string().required().min(3).max(50),
            rollNo: Joi.string().required(),
            class: Joi.string().required(),
            section: Joi.string().required(),
            dateOfBirth: Joi.date().required(),
            gender: Joi.string().valid('Male', 'Female', 'Other').required(),
            parentInfo: Joi.object({
                fatherName: Joi.string().required(),
                motherName: Joi.string().required(),
                email: Joi.string().email().required(),
                phone: Joi.string().required()
            }),
            address: Joi.object({
                street: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                pincode: Joi.string().required(),
                country: Joi.string().required()
            })
        })
    },

    // Admission Validation
    submitAdmission: {
        body: Joi.object({
            studentDetails: Joi.object({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                dateOfBirth: Joi.date().required(),
                gender: Joi.string().valid('Male', 'Female', 'Other').required(),
                bloodGroup: Joi.string(),
                nationality: Joi.string().required(),
                religion: Joi.string(),
                category: Joi.string()
            }),
            academic: Joi.object({
                appliedClass: Joi.string().required(),
                previousSchool: Joi.string(),
                previousClass: Joi.string(),
                academicYear: Joi.string().required(),
                transferCertificate: Joi.string()
            }),
            parentDetails: Joi.object({
                father: Joi.object({
                    name: Joi.string().required(),
                    occupation: Joi.string(),
                    education: Joi.string(),
                    contact: Joi.string().required(),
                    email: Joi.string().email().required()
                }),
                mother: Joi.object({
                    name: Joi.string().required(),
                    occupation: Joi.string(),
                    education: Joi.string(),
                    contact: Joi.string().required(),
                    email: Joi.string().email()
                }),
                guardian: Joi.object({
                    name: Joi.string(),
                    relation: Joi.string(),
                    contact: Joi.string(),
                    email: Joi.string().email()
                })
            })
        })
    },

    // Attendance Validation
    submitAttendance: {
        body: Joi.object({
            date: Joi.date().required(),
            class: Joi.string().required(),
            section: Joi.string().required(),
            attendance: Joi.object().pattern(
                Joi.string(),
                Joi.string().valid('present', 'absent', 'late')
            ).required(),
            submittedBy: Joi.string().required()
        })
    },

    // Leave Request Validation
    submitLeaveRequest: {
        body: Joi.object({
            from: Joi.date().required(),
            to: Joi.date().required(),
            reason: Joi.string().required().min(10).max(500),
            type: Joi.string().valid('sick', 'casual', 'other').required()
        })
    },

    // Assignment Submission Validation
    submitAssignment: {
        params: Joi.object({
            assignmentId: Joi.string().required()
        }),
        body: Joi.object({
            comment: Joi.string().max(500),
            files: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    type: Joi.string().required(),
                    size: Joi.number().max(5242880) // 5MB max
                })
            )
        })
    },

    // Settings Update Validation
    updateProfile: {
        body: Joi.object({
            name: Joi.string().min(3).max(50),
            email: Joi.string().email(),
            phone: Joi.string(),
            address: Joi.object({
                street: Joi.string(),
                city: Joi.string(),
                state: Joi.string(),
                pincode: Joi.string(),
                country: Joi.string()
            }),
            socialLinks: Joi.object({
                facebook: Joi.string().uri(),
                twitter: Joi.string().uri(),
                linkedin: Joi.string().uri(),
                instagram: Joi.string().uri()
            })
        })
    },

    updatePassword: {
        body: Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string()
                .min(8)
                .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .required()
                .messages({
                    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
                })
        })
    },

    // Library Validation
    issueBook: {
        body: Joi.object({
            bookId: Joi.string().required()
        })
    },

    // Query Validations
    pagination: {
        query: Joi.object({
            page: Joi.number().min(1),
            limit: Joi.number().min(1).max(100),
            sortBy: Joi.string(),
            order: Joi.string().valid('asc', 'desc'),
            search: Joi.string(),
            filter: Joi.object()
        })
    },

    dateRange: {
        query: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().required().min(Joi.ref('startDate'))
        })
    }
};

module.exports = studentValidation;