const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

// Example function
exports.someFunction = catchAsync(async (req, res) => {
    // Your logic here
    res.json(ApiResponse.success('This is a response from someFunction'));
}); 