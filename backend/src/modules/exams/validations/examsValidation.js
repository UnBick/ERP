const Joi = require('joi');

const examValidation = {
    schedule: {
        create: Joi.object({
            subject: Joi.string().required().hex().length(24),
            date: Joi.date().required(),
            duration: Joi.number().required().min(30).max(180),
            class: Joi.string().required().hex().length(24),
            section: Joi.string().required().hex().length(24),
            examType: Joi.string().required().valid('Mid Term', 'Final Term', 'Unit Test', 'Practice'),
            totalMarks: Joi.number().required().min(0),
            passingMarks: Joi.number().required().min(0),
            status: Joi.string().valid('Scheduled', 'Ongoing', 'Completed', 'Cancelled')
        }),

        update: Joi.object({
            date: Joi.date(),
            duration: Joi.number().min(30).max(180),
            totalMarks: Joi.number().min(0),
            passingMarks: Joi.number().min(0),
            status: Joi.string().valid('Scheduled', 'Ongoing', 'Completed', 'Cancelled')
        })
    },

    marks: {
        create: Joi.object({
            student: Joi.string().required().hex().length(24),
            examSchedule: Joi.string().required().hex().length(24),
            marksObtained: Joi.number().required().min(0),
            remarks: Joi.string()
        }),

        update: Joi.object({
            marksObtained: Joi.number().min(0),
            remarks: Joi.string(),
            status: Joi.string().valid('Draft', 'Published')
        })
    },

    grade: {
        create: Joi.object({
            grade: Joi.string().required(),
            gpa: Joi.number().required().min(0).max(4),
            minMarks: Joi.number().required().min(0).max(100),
            maxMarks: Joi.number().required().min(0).max(100),
            description: Joi.string(),
            remarks: Joi.string()
        }),

        update: Joi.object({
            grade: Joi.string(),
            gpa: Joi.number().min(0).max(4),
            minMarks: Joi.number().min(0).max(100),
            maxMarks: Joi.number().min(0).max(100),
            description: Joi.string(),
            remarks: Joi.string()
        })
    }
};

module.exports = examValidation;