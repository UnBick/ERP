const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Grade = require('../models/resultsModel');

const getAllGrades = catchAsync(async (req, res) => {
    const grades = await Grade.find().sort({ minMarks: -1 });
    res.json(ApiResponse.success('Grades retrieved successfully', grades));
});

const createGrade = catchAsync(async (req, res) => {
    const grade = await Grade.create(req.body);
    res.status(201).json(ApiResponse.success('Grade created successfully', grade));
});

const updateGrade = catchAsync(async (req, res) => {
    const { id } = req.params;
    const grade = await Grade.findByIdAndUpdate(id, req.body, { new: true });
    res.json(ApiResponse.success('Grade updated successfully', grade));
});

const deleteGrade = catchAsync(async (req, res) => {
    await Grade.findByIdAndDelete(req.params.id);
    res.json(ApiResponse.success('Grade deleted successfully'));
});

module.exports = {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
};