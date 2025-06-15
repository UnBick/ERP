const Joi = require('joi');

const feesValidation = {
    feeStructure: {
        create: Joi.object({
            class: Joi.string().required().hex().length(24),
            academicYear: Joi.string().required().pattern(/^\d{4}-\d{4}$/),
            components: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    amount: Joi.number().required().min(0),
                    isOptional: Joi.boolean().default(false)
                })
            ).min(1).required(),
            totalAmount: Joi.number().required().min(0),
            isActive: Joi.boolean().default(true)
        }),
        update: Joi.object({
            components: Joi.array().items(
                Joi.object({
                    name: Joi.string(),
                    amount: Joi.number().min(0),
                    isOptional: Joi.boolean()
                })
            ),
            totalAmount: Joi.number().min(0),
            isActive: Joi.boolean()
        })
    },

    feeAdjustment: {
        create: Joi.object({
            category: Joi.string().required().valid('general', 'obc', 'sc', 'st'),
            type: Joi.string().required().valid('percentage', 'amount'),
            value: Joi.number().required().min(0),
            academicYear: Joi.string().required().pattern(/^\d{4}-\d{4}$/),
            description: Joi.string(),
            isActive: Joi.boolean().default(true)
        }),
        update: Joi.object({
            type: Joi.string().valid('percentage', 'amount'),
            value: Joi.number().min(0),
            description: Joi.string(),
            isActive: Joi.boolean()
        })
    },

    transportFee: {
        create: Joi.object({
            route: Joi.string().required().hex().length(24),
            distance: Joi.number().required().min(0),
            amount: Joi.number().required().min(0),
            academicYear: Joi.string().required().pattern(/^\d{4}-\d{4}$/),
            isActive: Joi.boolean().default(true)
        }),
        update: Joi.object({
            distance: Joi.number().min(0),
            amount: Joi.number().min(0),
            isActive: Joi.boolean()
        })
    },

    lateFee: {
        create: Joi.object({
            daysLate: Joi.number().required().min(1),
            penaltyType: Joi.string().required().valid('fixed', 'percentage'),
            value: Joi.number().required().min(0),
            maxPenalty: Joi.number().min(0),
            description: Joi.string(),
            isActive: Joi.boolean().default(true)
        }),
        update: Joi.object({
            penaltyType: Joi.string().valid('fixed', 'percentage'),
            value: Joi.number().min(0),
            maxPenalty: Joi.number().min(0),
            description: Joi.string(),
            isActive: Joi.boolean()
        })
    },

    feeCollection: {
        create: Joi.object({
            student: Joi.string().required().hex().length(24),
            feeId: Joi.string().required().hex().length(24),
            amount: Joi.number().required().min(0),
            paymentMode: Joi.string().required().valid('cash', 'online', 'cheque', 'bank_transfer'),
            remarks: Joi.string()
        })
    },

    waiveLateFee: {
        params: Joi.object({
            feeId: Joi.string().required().hex().length(24)
        })
    },

    reports: {
        collection: Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().required().min(Joi.ref('startDate')),
            paymentMode: Joi.string().valid('cash', 'online', 'cheque', 'bank_transfer'),
            class: Joi.string().hex().length(24)
        }),
        defaulters: Joi.object({
            class: Joi.string().hex().length(24),
            asOfDate: Joi.date(),
            includePartialPaid: Joi.boolean().default(true)
        })
    }
};

module.exports = feesValidation;