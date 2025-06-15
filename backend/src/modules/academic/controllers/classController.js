const Class = require('../models/classModel');
const catchAsync = require('../../../utils/catchAsync');

exports.getAllClasses = catchAsync(async (req, res) => {
    console.log('[ClassController] Getting all classes');
    try {
        const classes = await Class.find();
        res.json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching classes',
            error: error.message
        });
    }
});

// ... other controller methods (createClass, updateClass, deleteClass)
