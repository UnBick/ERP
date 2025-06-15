const Joi = require('joi');

const validateRequest = (schema) => (req, res, next) => {
  const options = {
    abortEarly: false, // Include all errors
    allowUnknown: true, // Ignore unknown props
    stripUnknown: true // Remove unknown props
  };

  const { error, value } = schema.validate(req.body, options);
  
  if (error) {
    const errors = error.details.map(err => ({
      field: err.path.join('.'),
      message: err.message.replace(/"/g, '')
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  // Replace req.body with validated values
  req.body = value;
  next();
};

module.exports = validateRequest;