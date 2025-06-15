const validate = (schema) => (req, res, next) => {
    try {
        if (!schema) {
            return next();
        }

        // Validate based on request type
        const validationSchema = {
            params: schema.params,
            query: schema.query,
            body: schema.body
        };

        // Validate each part if schema exists
        ['params', 'query', 'body'].forEach(key => {
            if (validationSchema[key]) {
                const { error } = validationSchema[key].validate(req[key], { 
                    abortEarly: false,
                    allowUnknown: true
                });
                
                if (error) {
                    throw error;
                }
            }
        });

        next();
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.details?.map(err => ({
                field: err.context?.key,
                message: err.message
            }))
        });
    }
};

module.exports = validate;
