const Joi = require('joi');

const messageValidation = {
    sendMessage: {
        body: Joi.object({
            recipientId: Joi.string().required().hex().length(24),
            recipientType: Joi.string().required().valid('student', 'parent', 'teacher', 'admin'),
            content: Joi.string().required().min(1),
            subject: Joi.string(),
            attachments: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    url: Joi.string().required(),
                    type: Joi.string().required()
                })
            )
        })
    },

    updateMessage: {
        params: Joi.object({
            messageId: Joi.string().required().hex().length(24),
            action: Joi.string().required().valid('read', 'star', 'unstar', 'archive')
        })
    }
};

module.exports = messageValidation;
