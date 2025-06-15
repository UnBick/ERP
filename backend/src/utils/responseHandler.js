class ResponseHandler {
    constructor() {
        this.defaultSuccessMessage = 'Operation successful';
        this.defaultErrorMessage = 'An error occurred';
    }

    success(res, data = null, message = this.defaultSuccessMessage, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    error(res, error = null, message = this.defaultErrorMessage, statusCode = 500) {
        const errorResponse = {
            success: false,
            message: message || error?.message || this.defaultErrorMessage,
            data: null,
            error: process.env.NODE_ENV === 'development' ? error : undefined
        };

        return res.status(statusCode).json(errorResponse);
    }

    // Specific response handlers
    notFound(res, message = 'Resource not found') {
        return this.error(res, null, message, 404);
    }

    badRequest(res, message = 'Invalid request', error = null) {
        return this.error(res, error, message, 400);
    }

    unauthorized(res, message = 'Unauthorized access') {
        return this.error(res, null, message, 401);
    }

    forbidden(res, message = 'Access forbidden') {
        return this.error(res, null, message, 403);
    }

    // Validation error handler
    validationError(res, errors) {
        return this.error(res, errors, 'Validation failed', 422);
    }

    // Custom response with pagination
    paginated(res, data, page, limit, total) {
        return this.success(res, {
            items: data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
}

module.exports = new ResponseHandler();
