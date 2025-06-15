const catchAsync = require('../../../utils/catchAsync');
const Marks = require('../models/marksModel');
const ExamGrade = require('../models/gradeModel');
const ExamType = require('../models/examTypeModel');

const getMarks = catchAsync(async (req, res) => {
  const { examType, class: classId, section, subject } = req.query;
  
  const query = {};
  if (examType) query.examType = examType;
  if (classId) query.class = classId;
  if (section) query.section = section;
  if (subject) query.subject = subject;

  const marks = await Marks.find(query)
    .populate('student', 'name rollNumber')
    .populate('subject', 'name code')
    .populate('grade', 'grade gpaValue')
    .sort({ 'student.rollNumber': 1 });

  return res.json({
    success: true,
    message: 'Marks fetched successfully',
    data: marks
  });
});

const submitMarks = catchAsync(async (req, res) => {
  const { examType, class: classId, section, subject, marks } = req.body;

  // Validate if marks already exist
  const existingMarks = await Marks.findOne({
    examType, class: classId, section, subject
  });

  if (existingMarks) {
    return res.status(400).json({
      success: false,
      message: 'Marks already exist for this combination'
    });
  }

  // Create marks entries for each student
  const marksEntries = await Promise.all(
    marks.map(async (mark) => {
      // Calculate grade
      const grade = await ExamGrade.findOne({
        minMarks: { $lte: mark.marksObtained },
        maxMarks: { $gte: mark.marksObtained }
      });

      return {
        examType,
        class: classId,
        section,
        subject,
        student: mark.studentId,
        marksObtained: mark.marksObtained,
        grade: grade?._id,
        status: 'Submitted',
        submittedBy: req.user?._id,
        submittedAt: new Date()
      };
    })
  );

  const savedMarks = await Marks.create(marksEntries);

  return res.status(201).json({
    success: true,
    message: 'Marks submitted successfully',
    data: savedMarks
  });
});

const updateMarks = catchAsync(async (req, res) => {
  const { examType, class: classId, section, subject, marks } = req.body;

  const updatedMarks = await Promise.all(
    marks.map(async (mark) => {
      const grade = await ExamGrade.findOne({
        minMarks: { $lte: mark.marksObtained },
        maxMarks: { $gte: mark.marksObtained }
      });

      return Marks.findOneAndUpdate(
        {
          examType,
          class: classId,
          section,
          subject,
          student: mark.studentId
        },
        {
          marksObtained: mark.marksObtained,
          grade: grade?._id,
          modifiedBy: req.user?._id,
          modifiedAt: new Date()
        },
        { new: true }
      );
    })
  );

  return res.json({
    success: true,
    message: 'Marks updated successfully',
    data: updatedMarks
  });
});

const publishMarks = catchAsync(async (req, res) => {
  const { examType, class: classId, section } = req.params;

  const result = await Marks.updateMany(
    { examType, class: classId, section },
    { 
      status: 'Published',
      modifiedBy: req.user?._id,
      modifiedAt: new Date()
    }
  );

  return res.json({
    success: true,
    message: 'Marks published successfully',
    data: result
  });
});

const getExaminations = catchAsync(async (req, res) => {
  try {
    const examinations = await ExamType.find({ isActive: true })
      .populate('applicableClasses', 'name')
      .populate({
        path: 'exceptions',
        populate: {
          path: 'subject',
          select: 'name code'
        }
      })
      .lean();

    const transformedExams = examinations.map(exam => ({
      id: exam._id,
      name: exam.name,
      shortName: exam.shortName,
      totalMarks: exam.totalMarks,
      duration: exam.duration,
      classes: exam.applicableClasses.map(c => ({
        id: c._id,
        name: c.name
      })),
      exceptions: exam.exceptions
    }));

    return res.status(200).json({
      success: true,
      data: transformedExams
    });
  } catch (error) {
    console.error('Error fetching examinations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching examinations'
    });
  }
});

module.exports = {
  getMarks,
  submitMarks,
  updateMarks,
  publishMarks,
  getExaminations
};