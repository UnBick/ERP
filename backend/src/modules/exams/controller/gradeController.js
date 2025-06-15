const catchAsync = require('../../../utils/catchAsync');
const Grade = require('../models/gradeModel'); // Update model import to use ExamGrade

const createGrade = catchAsync(async (req, res) => {
  try {
    const { grade, minMarks, maxMarks, gpaValue } = req.body;

    // Basic validation
    if (!grade || !minMarks || !maxMarks || !gpaValue) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate grade format
    if (!/^[A-F][+-]?$/.test(grade)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid grade format. Use A+, A, A-, B+, etc.'
      });
    }

    // Convert string values to numbers
    const gradeData = {
      grade,
      minMarks: parseFloat(minMarks),
      maxMarks: parseFloat(maxMarks),
      gpaValue: parseFloat(gpaValue)
    };

    // Additional validations
    if (gradeData.minMarks >= gradeData.maxMarks) {
      return res.status(400).json({
        success: false,
        message: 'Minimum marks must be less than maximum marks'
      });
    }

    if (gradeData.gpaValue < 0 || gradeData.gpaValue > 10) {
      return res.status(400).json({
        success: false,
        message: 'GPA value must be between 0 and 10'
      });
    }

    const newGrade = await Grade.create(gradeData);

    return res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: newGrade
    });

  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: 'Grade already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

const getGrades = catchAsync(async (req, res) => {
  try {
    const grades = await Grade.find()
      .sort({ minMarks: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Grades fetched successfully',
      data: grades
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching grades',
      error: error.message
    });
  }
});

const updateGrade = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, minMarks, maxMarks, gpaValue } = req.body;

    if (minMarks >= maxMarks) {
      return res.status(400).json({
        success: false,
        message: 'Minimum marks must be less than maximum marks'
      });
    }

    const overlapping = await Grade.findOne({
      _id: { $ne: id },
      $or: [
        { minMarks: { $lte: maxMarks }, maxMarks: { $gte: minMarks } },
        { grade: grade }
      ]
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'Grade range overlaps with existing grade or grade letter already exists'
      });
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      {
        grade,
        minMarks: parseFloat(minMarks),
        maxMarks: parseFloat(maxMarks),
        gpaValue: parseFloat(gpaValue)
      },
      { new: true }
    );

    if (!updatedGrade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    return res.json({
      success: true,
      message: 'Grade updated successfully',
      data: updatedGrade
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating grade',
      error: error.message
    });
  }
});

const deleteGrade = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGrade = await Grade.findByIdAndDelete(id);

    if (!deletedGrade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    return res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting grade',
      error: error.message
    });
  }
});

module.exports = {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade
};
