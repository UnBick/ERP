const Class = require('../models/Class');
const catchAsync = require('../../../utils/catchAsync');

exports.getAllClasses = catchAsync(async (req, res) => {
    try {
        const classes = await Class.find({ isActive: true })
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            message: 'Classes retrieved successfully',
            data: classes.map(cls => ({
                _id: cls._id,
                name: cls.name,
                level: cls.level,
                capacity: cls.capacity,
                academicYear: cls.academicYear
            }))
        });
    } catch (error) {
        console.error('Error in getAllClasses:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve classes',
            error: error.message
        });
    }
});

// ...rest of controller methods
