const Joi = require('joi');

// Common patterns and validations
const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const academicYearPattern = /^\d{4}-\d{4}$/;
const classLevels = ['Primary', 'Middle School', 'High School'];

const academicValidation = {
    // Class Validations
    class: {
        create: Joi.object({
            name: Joi.string().required().trim(),
            level: Joi.string().required().valid(...classLevels),
            academicYear: Joi.string().required().pattern(academicYearPattern),
            capacity: Joi.number().required().min(1).max(100),
            section: Joi.array().items(Joi.string().hex().length(24)),
            subjects: Joi.array().items(Joi.string().hex().length(24)),
            classTeacher: Joi.string().hex().length(24),
            schedule: Joi.object().pattern(
                Joi.string(),
                Joi.string()
            ),
            description: Joi.string(),
            isActive: Joi.boolean().default(true)
        }),

        update: Joi.object({
            name: Joi.string().trim(),
            level: Joi.string().valid(...classLevels),
            capacity: Joi.number().min(1).max(100),
            classTeacher: Joi.string().hex().length(24),
            description: Joi.string(),
            isActive: Joi.boolean()
        })
    },

    // Section Validations
    section: {
        create: Joi.object({
            name: Joi.string().required().trim(),
            classId: Joi.string().required().hex().length(24),
            capacity: Joi.number().required().min(1),
            teacher: Joi.string().hex().length(24),
            currentStudents: Joi.number().default(0),
            schedule: Joi.object().pattern(
                Joi.string(),
                Joi.string()
            ),
            isActive: Joi.boolean().default(true)
        }),

        update: Joi.object({
            name: Joi.string().trim(),
            capacity: Joi.number().min(1),
            teacher: Joi.string().hex().length(24),
            schedule: Joi.object().pattern(
                Joi.string(),
                Joi.string()
            ),
            isActive: Joi.boolean()
        })
    },

    // Subject Validations
    subject: {
        create: Joi.object({
            name: Joi.string().required().trim(),
            code: Joi.string().required().trim(),
            description: Joi.string(),
            class: Joi.string().required().hex().length(24),
            teacher: Joi.string().hex().length(24),
            credits: Joi.number().required().min(0),
            isElective: Joi.boolean().default(false),
            syllabus: Joi.string().hex().length(24),
            isActive: Joi.boolean().default(true)
        }),

        update: Joi.object({
            name: Joi.string().trim(),
            description: Joi.string(),
            teacher: Joi.string().hex().length(24),
            credits: Joi.number().min(0),
            isElective: Joi.boolean(),
            syllabus: Joi.string().hex().length(24),
            isActive: Joi.boolean()
        })
    },

    // Syllabus Validations
    syllabus: {
        create: Joi.object({
            subject: Joi.string().required().hex().length(24),
            academicYear: Joi.string().required().pattern(academicYearPattern),
            units: Joi.array().items(Joi.object({
                title: Joi.string().required(),
                description: Joi.string(),
                topics: Joi.array().items(Joi.object({
                    name: Joi.string().required(),
                    duration: Joi.number().required(),
                    resources: Joi.array().items(Joi.string())
                })),
                totalHours: Joi.number().required()
            })),
            textbooks: Joi.array().items(Joi.object({
                title: Joi.string().required(),
                author: Joi.string().required(),
                publisher: Joi.string(),
                year: Joi.number(),
                isRequired: Joi.boolean().default(true)
            })),
            references: Joi.array().items(Joi.object({
                title: Joi.string().required(),
                link: Joi.string(),
                type: Joi.string().valid('book', 'website', 'video', 'document')
            })),
            status: Joi.string().valid('draft', 'published', 'archived').default('draft')
        }),

        update: Joi.object({
            units: Joi.array().items(Joi.object({
                title: Joi.string(),
                description: Joi.string(),
                topics: Joi.array().items(Joi.object({
                    name: Joi.string(),
                    duration: Joi.number(),
                    resources: Joi.array().items(Joi.string())
                })),
                totalHours: Joi.number()
            })),
            textbooks: Joi.array().items(Joi.object({
                title: Joi.string(),
                author: Joi.string(),
                publisher: Joi.string(),
                year: Joi.number(),
                isRequired: Joi.boolean()
            })),
            references: Joi.array().items(Joi.object({
                title: Joi.string(),
                link: Joi.string(),
                type: Joi.string().valid('book', 'website', 'video', 'document')
            })),
            status: Joi.string().valid('draft', 'published', 'archived')
        })
    },

    // Timetable Validations
    timetable: {
        create: Joi.object({
            class: Joi.string().required().hex().length(24),
            section: Joi.string().required().hex().length(24),
            academicYear: Joi.string().required().pattern(academicYearPattern),
            schedule: Joi.object({
                monday: Joi.array().items(Joi.object({
                    subject: Joi.string().required().hex().length(24),
                    teacher: Joi.string().required().hex().length(24),
                    startTime: Joi.string().required().pattern(timePattern),
                    endTime: Joi.string().required().pattern(timePattern),
                    room: Joi.string().required()
                })),
                tuesday: Joi.array().items(Joi.object({
                    subject: Joi.string().required().hex().length(24),
                    teacher: Joi.string().required().hex().length(24),
                    startTime: Joi.string().required().pattern(timePattern),
                    endTime: Joi.string().required().pattern(timePattern),
                    room: Joi.string().required()
                })),
                wednesday: Joi.array().items(Joi.object({
                    subject: Joi.string().required().hex().length(24),
                    teacher: Joi.string().required().hex().length(24),
                    startTime: Joi.string().required().pattern(timePattern),
                    endTime: Joi.string().required().pattern(timePattern),
                    room: Joi.string().required()
                })),
                thursday: Joi.array().items(Joi.object({
                    subject: Joi.string().required().hex().length(24),
                    teacher: Joi.string().required().hex().length(24),
                    startTime: Joi.string().required().pattern(timePattern),
                    endTime: Joi.string().required().pattern(timePattern),
                    room: Joi.string().required()
                })),
                friday: Joi.array().items(Joi.object({
                    subject: Joi.string().required().hex().length(24),
                    teacher: Joi.string().required().hex().length(24),
                    startTime: Joi.string().required().pattern(timePattern),
                    endTime: Joi.string().required().pattern(timePattern),
                    room: Joi.string().required()
                })),
                saturday: Joi.array().items(Joi.object({
                    subject: Joi.string().required().hex().length(24),
                    teacher: Joi.string().required().hex().length(24),
                    startTime: Joi.string().required().pattern(timePattern),
                    endTime: Joi.string().required().pattern(timePattern),
                    room: Joi.string().required()
                }))
            }).required(),
            isActive: Joi.boolean().default(true)
        }),

        update: Joi.object({
            schedule: Joi.object({
                monday: Joi.array().items(Joi.object({
                    subject: Joi.string().hex().length(24),
                    teacher: Joi.string().hex().length(24),
                    startTime: Joi.string().pattern(timePattern),
                    endTime: Joi.string().pattern(timePattern),
                    room: Joi.string()
                })),
                tuesday: Joi.array().items(Joi.object({
                    subject: Joi.string().hex().length(24),
                    teacher: Joi.string().hex().length(24),
                    startTime: Joi.string().pattern(timePattern),
                    endTime: Joi.string().pattern(timePattern),
                    room: Joi.string()
                })),
                wednesday: Joi.array().items(Joi.object({
                    subject: Joi.string().hex().length(24),
                    teacher: Joi.string().hex().length(24),
                    startTime: Joi.string().pattern(timePattern),
                    endTime: Joi.string().pattern(timePattern),
                    room: Joi.string()
                })),
                thursday: Joi.array().items(Joi.object({
                    subject: Joi.string().hex().length(24),
                    teacher: Joi.string().hex().length(24),
                    startTime: Joi.string().pattern(timePattern),
                    endTime: Joi.string().pattern(timePattern),
                    room: Joi.string()
                })),
                friday: Joi.array().items(Joi.object({
                    subject: Joi.string().hex().length(24),
                    teacher: Joi.string().hex().length(24),
                    startTime: Joi.string().pattern(timePattern),
                    endTime: Joi.string().pattern(timePattern),
                    room: Joi.string()
                })),
                saturday: Joi.array().items(Joi.object({
                    subject: Joi.string().hex().length(24),
                    teacher: Joi.string().hex().length(24),
                    startTime: Joi.string().pattern(timePattern),
                    endTime: Joi.string().pattern(timePattern),
                    room: Joi.string()
                }))
            }),
            isActive: Joi.boolean()
        })
    }
};

module.exports = academicValidation;