const Joi = require('joi');

const aiValidation = {
  generateQuestions: Joi.object({
    syllabusContent: Joi.string().required().min(10),
    bookContent: Joi.string().required().min(10),
    parameters: Joi.object({
      topic: Joi.string().required(),
      difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
      totalQuestions: Joi.number().integer().min(1).max(50).required(),
      questionTypes: Joi.array().items(
        Joi.string().valid('mcq', 'descriptive', 'true-false')
      ).min(1).required(),
      timeLimit: Joi.number().integer().min(1),
      totalMarks: Joi.number().integer().min(1),
      purpose: Joi.string().valid('assignment', 'quiz', 'practice').required()
    }).required()
  }),

  getContent: Joi.object({
    id: Joi.string().required().hex().length(24)
  }),

  updateContentStatus: Joi.object({
    id: Joi.string().required().hex().length(24),
    status: Joi.string().valid('approved', 'rejected').required(),
    feedback: Joi.string().when('status', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  })
};

module.exports = aiValidation;
