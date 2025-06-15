const Joi = require('joi');

const predefinesyllabusValidation = {
    // Book Validations
    book: {
        create: Joi.object({
            class: Joi.string().required().hex().length(24),
            subject: Joi.string().required().hex().length(24),
            title: Joi.string().required().min(3).max(100),
            author: Joi.string().required(),
            publisher: Joi.string(),
            edition: Joi.string(),
            isbn: Joi.string().pattern(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/),
            description: Joi.string().max(500),
            category: Joi.string().required(),
            readingLevel: Joi.string().valid('beginner', 'intermediate', 'advanced'),
            totalPages: Joi.number().min(1),
            price: Joi.number().min(0),
            fileType: Joi.string().valid('pdf', 'epub').required(),
            isRequired: Joi.boolean()
        }),

        update: Joi.object({
            title: Joi.string().min(3).max(100),
            author: Joi.string(),
            publisher: Joi.string(),
            edition: Joi.string(),
            description: Joi.string().max(500),
            category: Joi.string(),
            readingLevel: Joi.string().valid('beginner', 'intermediate', 'advanced'),
            price: Joi.number().min(0),
            isRequired: Joi.boolean()
        }),

        updateProgress: Joi.object({
            currentPage: Joi.number().required().min(1),
            timeSpent: Joi.number().required().min(0)
        }),

        addBookmark: Joi.object({
            page: Joi.number().required().min(1),
            note: Joi.string().max(200)
        }),

        addAnnotation: Joi.object({
            page: Joi.number().required().min(1),
            text: Joi.string().required().max(500),
            position: Joi.object({
                x: Joi.number().required(),
                y: Joi.number().required()
            })
        })
    },

    // Syllabus Validations
    syllabus: {
        create: Joi.object({
            class: Joi.string().required().hex().length(24),
            subject: Joi.string().required().hex().length(24),
            title: Joi.string().required().min(3).max(100),
            description: Joi.string().max(500),
            chapters: Joi.array().items(
                Joi.object({
                    title: Joi.string().required(),
                    topics: Joi.array().items(
                        Joi.object({
                            title: Joi.string().required(),
                            description: Joi.string(),
                            duration: Joi.number(),
                            resources: Joi.array().items(
                                Joi.object({
                                    type: Joi.string().required(),
                                    url: Joi.string().uri().required()
                                })
                            )
                        })
                    )
                })
            ).min(1),
            content: Joi.string().required()
        }),

        update: Joi.object({
            title: Joi.string().min(3).max(100),
            description: Joi.string().max(500),
            chapters: Joi.array().items(
                Joi.object({
                    title: Joi.string(),
                    topics: Joi.array().items(
                        Joi.object({
                            title: Joi.string(),
                            description: Joi.string(),
                            duration: Joi.number(),
                            resources: Joi.array().items(
                                Joi.object({
                                    type: Joi.string(),
                                    url: Joi.string().uri()
                                })
                            )
                        })
                    )
                })
            )
        })
    },

    // Video Validations
    video: {
        create: Joi.object({
            class: Joi.string().required().hex().length(24),
            subject: Joi.string().required().hex().length(24),
            title: Joi.string().required().min(3).max(100),
            description: Joi.string().max(500),
            url: Joi.string().uri().when('source', {
                is: Joi.string().valid('youtube', 'vimeo'),
                then: Joi.required()
            }),
            source: Joi.string().valid('youtube', 'vimeo', 'local').required(),
            duration: Joi.string(),
            tags: Joi.array().items(Joi.string())
        }),

        update: Joi.object({
            title: Joi.string().min(3).max(100),
            description: Joi.string().max(500),
            tags: Joi.array().items(Joi.string())
        })
    },

    // Assignment Validations
    assignment: {
        create: Joi.object({
            class: Joi.string().required().hex().length(24),
            subject: Joi.string().required().hex().length(24),
            title: Joi.string().required().min(3).max(100),
            description: Joi.string().required(),
            dueDate: Joi.date().required().greater('now'),
            maxMarks: Joi.number().required().min(0),
            status: Joi.string().valid('draft', 'published')
        }),

        update: Joi.object({
            title: Joi.string().min(3).max(100),
            description: Joi.string(),
            dueDate: Joi.date().greater('now'),
            maxMarks: Joi.number().min(0),
            status: Joi.string().valid('draft', 'published', 'expired')
        }),

        submission: Joi.object({
            remarks: Joi.string().max(500)
        }),

        grading: Joi.object({
            grade: Joi.number().required().min(0),
            remarks: Joi.string().max(500)
        })
    }
};

module.exports = predefinesyllabusValidation;