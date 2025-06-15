const AIService = require('../services/aiService');
const AIContent = require('../models/aiContent');
const AppError = require('../../../utils/appError');

exports.generateQuestions = async (req, res, next) => {
  try {
    const { syllabusContent, bookContent, parameters } = req.body;

    // Generate questions using AI service
    const questions = await AIService.generateQuestions(
      syllabusContent,
      bookContent,
      parameters
    );

    // Store the generated content
    const aiContent = await AIContent.create({
      type: 'questions',
      content: questions,
      parameters,
      generatedBy: req.user._id
    });

    res.status(201).json({
      status: 'success',
      data: {
        questions,
        contentId: aiContent._id
      }
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

exports.getGeneratedContent = async (req, res, next) => {
  try {
    const content = await AIContent.findById(req.params.id);
    
    if (!content) {
      return next(new AppError('Generated content not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: content
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
