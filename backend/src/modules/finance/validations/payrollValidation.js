const Joi = require('joi');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

const salaryValidation = {
    create: Joi.object({
        staffId: Joi.string().required().hex().length(24),
        amount: Joi.number().required().min(0),
        month: Joi.string().required().valid(...months),
        year: Joi.number().required().min(2000).max(2100)
    }),

    update: Joi.object({
        amount: Joi.number().min(0),
        month: Joi.string().valid(...months),
        year: Joi.number().min(2000).max(2100),
        status: Joi.string().valid('pending', 'processed', 'paid')
    })
};

module.exports = salaryValidation;