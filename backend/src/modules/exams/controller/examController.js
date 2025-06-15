const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const ExamType = require('../models/examTypeModel');
const ExamSchedule = require('../models/examScheduleModel');
const PublishSetting = require('../models/publishSettingModel');
const Class = require('../../academic/models/classModel');
const Subject = require('../../academic/models/subjectModel');
const Section = require('../../academic/models/sectionModel');
const Student = require('../../student/models/studentModel');
const mongoose = require('mongoose');

// Exam Type Management
const createExamType = catchAsync(async (req, res) => {
  try {
    console.log('Create Exam Request Body:', req.body);

    // Validate required fields
    const requiredFields = ['name', 'totalMarks', 'duration', 'applicableClasses'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate numeric fields
    if (isNaN(req.body.totalMarks) || isNaN(req.body.duration)) {
      return res.status(400).json({
        success: false,
        message: 'Total marks and duration must be numbers'
      });
    }

    // Validate exceptions if present
    if (req.body.exceptions) {
      const validExceptions = req.body.exceptions.every(exc => 
        exc.subject && !isNaN(exc.totalMarks) && !isNaN(exc.duration)
      );

      if (!validExceptions) {
        return res.status(400).json({
          success: false,
          message: 'Invalid exception data provided'
        });
      }
    }

    const examType = await ExamType.create(req.body);
    
    console.log('Created Exam Type:', examType);

    return res.status(201).json({
      success: true,
      message: 'Exam type created successfully',
      data: examType
    });

  } catch (error) {
    console.error('Error in createExamType:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating exam type',
      error: error.message
    });
  }
});

const getExamTypes = catchAsync(async (req, res) => {
  try {
    const examTypes = await ExamType.find({ isActive: true })
      .populate('applicableClasses', 'name')
      .populate('exceptions.subject', 'name code')
      .lean();

    const transformedExams = examTypes.map(exam => ({
      _id: exam._id,
      name: exam.name,
      shortName: exam.shortName,
      totalMarks: exam.totalMarks,
      duration: exam.duration,
      applicableClasses: exam.applicableClasses.map(c => ({
        id: c._id,
        name: c.name
      })),
      exceptions: exam.exceptions.map(e => ({
        subject: e.subject,
        totalMarks: e.totalMarks,
        duration: e.duration
      }))
    }));

    return res.status(200).json({
      success: true,
      message: 'Exam types retrieved successfully',
      data: transformedExams
    });
  } catch (error) {
    console.error('Error fetching exam types:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving exam types'
    });
  }
});

const getExamById = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await ExamType.findById(id)
      .populate('applicableClasses', 'name')
      .populate('exceptions.subject', 'name code')
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam type not found'
      });
    }

    const transformedExam = {
      id: exam._id,
      name: exam.name,
      shortName: exam.shortName,
      totalMarks: exam.totalMarks,
      duration: exam.duration,
      applicableClasses: exam.applicableClasses.map(c => ({
        id: c._id,
        name: c.name
      })),
      exceptions: exam.exceptions
    };

    return res.status(200).json({
      success: true,
      message: 'Exam type retrieved successfully',
      data: transformedExam
    });

  } catch (error) {
    console.error('Error fetching exam type:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving exam type'
    });
  }
});

const updateExamType = catchAsync(async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating exam type:', id);
    console.log('Update data:', req.body);

    // Validate the incoming data
    if (!req.body.applicableClasses || !Array.isArray(req.body.applicableClasses)) {
      return res.status(400).json({
        success: false,
        message: 'applicableClasses must be an array of class IDs'
      });
    }

    // Ensure all class IDs are valid ObjectIds
    const validClassIds = req.body.applicableClasses.every(
      id => mongoose.Types.ObjectId.isValid(id)
    );

    if (!validClassIds) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class ID format'
      });
    }

    const updatedExam = await ExamType.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        shortName: req.body.shortName,
        totalMarks: req.body.totalMarks,
        duration: req.body.duration,
        applicableClasses: req.body.applicableClasses,
        exceptions: req.body.exceptions,
        isActive: req.body.isActive
      },
      { 
        new: true,
        runValidators: true
      }
    )
    .populate('applicableClasses', 'name')
    .populate('exceptions.subject', 'name code');

    if (!updatedExam) {
      return res.status(404).json({
        success: false,
        message: 'Exam type not found'
      });
    }

    return res.json({
      success: true,
      message: 'Exam type updated successfully',
      data: updatedExam
    });

  } catch (error) {
    console.error('Error in updateExamType:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating exam type',
      error: error.message
    });
  }
});

// Exam Scheduling
const createExamSchedule = catchAsync(async (req, res) => {
  try {
    const { examId, classId, schedule } = req.body;

    // Check if a schedule already exists for this exam-class combination
    const existingSchedule = await ExamSchedule.findOne({
      examType: examId,
      class: classId
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'A schedule already exists for this exam and class combination'
      });
    }

    // If no existing schedule, validate for conflicts and create new schedule
    const schedules = await ExamSchedule.create(
      schedule.map(s => ({
        examType: examId,
        class: classId,
        subject: s.subject,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration
      }))
    );

    return res.status(201).json({
      success: true,
      message: 'Exam schedule created successfully',
      data: schedules
    });

  } catch (error) {
    console.error('Error creating exam schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating exam schedule',
      error: error.message
    });
  }
});

const getExamSchedules = catchAsync(async (req, res) => {
  const { examId, classId } = req.query;
  const query = {};

  if (examId) query.examType = examId;
  if (classId) query.class = classId;

  const schedules = await ExamSchedule.find(query)
    .populate('examType', 'name shortName')
    .populate('class', 'name')
    .populate('subject', 'name code')
    .sort({ date: 1, startTime: 1 });

  res.json(ApiResponse.success('Exam schedules retrieved successfully', schedules));
});

// Publish Settings
const createPublishSetting = catchAsync(async (req, res) => {
  try {
    console.log('Creating publish setting:', req.body);
    
    const { examType } = req.body;

    // Check if publish setting already exists for this exam type
    const existingPublishSetting = await PublishSetting.findOne({ examType });
    if (existingPublishSetting) {
      return res.status(400).json({
        success: false,
        message: 'A publish setting already exists for this exam type'
      });
    }

    // Validate exam type exists
    const examExists = await ExamType.findById(examType);
    if (!examExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam type'
      });
    }

    const publishSetting = await PublishSetting.create(req.body);
    
    const populatedSetting = await PublishSetting.findById(publishSetting._id)
      .populate('examType', 'name shortName')
      .populate('classWiseSchedule.class', 'name');

    return res.status(201).json({
      success: true,
      message: 'Publish setting created successfully',
      data: populatedSetting
    });

  } catch (error) {
    console.error('Error creating publish setting:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating publish setting',
      error: error.message
    });
  }
});

const getPublishSettings = catchAsync(async (req, res) => {
  const settings = await PublishSetting.find()
    .populate('examType', 'name shortName')
    .populate('classWiseSchedule.class', 'name');
  res.json(ApiResponse.success('Publish settings retrieved successfully', settings));
});

const updatePublishSetting = catchAsync(async (req, res) => {
  const { id } = req.params;
  const setting = await PublishSetting.findByIdAndUpdate(id, req.body, { new: true })
    .populate('examType', 'name shortName')
    .populate('classWiseSchedule.class', 'name');
  res.json(ApiResponse.success('Publish setting updated successfully', setting));
});

// Utility Endpoints
const getClasses = catchAsync(async (req, res) => {
  try {
    console.log('[DEBUG] getClasses - Request received');
    console.log('Request headers:', req.headers);
    
    const classes = await Class.find({ isActive: true })
      .select('name level')
      .sort({ name: 1 })
      .lean();

    console.log('[DEBUG] getClasses - Found classes:', classes);

    res.status(200).json({
      success: true,
      message: 'Classes fetched successfully',
      data: classes
    });
  } catch (error) {
    console.error('[ERROR] getClasses:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
});

const getSubjects = catchAsync(async (req, res) => {
  try {
    console.log('[DEBUG] getSubjects - Request received');
    console.log('Request headers:', req.headers);
    
    const subjects = await Subject.find({ isActive: true })
      .select('name code level department')
      .sort({ name: 1 })
      .lean();

    console.log('[DEBUG] getSubjects - Found subjects:', subjects);

    res.status(200).json({
      success: true,
      message: 'Subjects fetched successfully',
      data: subjects
    });
  } catch (error) {
    console.error('[ERROR] getSubjects:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
});

const getSubjectsByClass = catchAsync(async (req, res) => {
  try {
    const { classId } = req.params;
    
    const classDoc = await Class.findById(classId).select('level').lean();
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const subjects = await Subject.find({
      $or: [
        { level: 'all' },
        { level: classDoc.level },
        { level: { $in: [classDoc.level] } }
      ],
      isActive: true
    })
    .select('name code')
    .sort({ name: 1 })
    .lean();

    return res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully',
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving subjects'
    });
  }
});

const getSections = catchAsync(async (req, res) => {
  try {
    const { classId } = req.params;
    
    const sections = await Section.find({ 
      class: classId,
      isActive: true 
    })
    .select('name')
    .sort({ name: 1 })
    .lean();

    return res.status(200).json({
      success: true,
      message: 'Sections retrieved successfully',
      data: sections
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving sections'
    });
  }
});

const getStudentsBySection = catchAsync(async (req, res) => {
  try {
    const { classId, sectionId } = req.params;
    console.log('Fetching students for class:', classId, 'section:', sectionId);
    
    const students = await Student.find({
      'academicInfo.class': classId,
      'academicInfo.section': sectionId,
      isActive: true
    })
    .select('personalInfo.firstName personalInfo.lastName academicInfo.rollNumber')
    .sort({ 'academicInfo.rollNumber': 1 })
    .lean();

    console.log('Found students:', students);

    if (!students.length) {
      return res.status(200).json({
        success: true,
        message: 'No students found in this section',
        data: []
      });
    }

    const transformedStudents = students.map(student => ({
      id: student._id,
      name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
      rollNo: student.academicInfo.rollNumber
    }));

    console.log('Transformed students:', transformedStudents);

    return res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: transformedStudents
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving students'
    });
  }
});

const validateSchedule = catchAsync(async (req, res) => {
  const { schedule } = req.body;
  
  // Check for time overlaps
  const overlaps = schedule.reduce((acc, curr, idx) => {
    const currStart = new Date(`${curr.date}T${curr.startTime}`);
    const currEnd = new Date(`${curr.date}T${curr.endTime}`);

    schedule.slice(idx + 1).forEach((next, nextIdx) => {
      const nextStart = new Date(`${next.date}T${next.startTime}`);
      const nextEnd = new Date(`${next.date}T${next.endTime}`);

      if (currStart < nextEnd && nextStart < currEnd) {
        acc.push({
          subject1: curr.subject,
          subject2: next.subject,
          date: curr.date
        });
      }
    });

    return acc;
  }, []);

  if (overlaps.length > 0) {
    return res.status(400).json(
      ApiResponse.error('Schedule conflicts detected', overlaps)
    );
  }

  res.json(ApiResponse.success('Schedule validation successful'));
});

// Auto-publish functionality
const checkAndPublishResults = catchAsync(async (req, res) => {
  const settings = await PublishSetting.find({
    autoPublish: true,
    'classWiseSchedule.publishDateTime': { $lte: new Date() }
  });

  for (const setting of settings) {
    for (const schedule of setting.classWiseSchedule) {
      if (schedule.publishDateTime <= new Date() && !schedule.isPublished) {
        // Publish logic here
        schedule.isPublished = true;
      }
    }
    await setting.save();
  }

  res.json(ApiResponse.success('Auto-publish check completed'));
});

module.exports = {
  // Exam Type endpoints
  createExamType,
  getExamTypes,
  getExamById,
  updateExamType,

  // Schedule endpoints
  createExamSchedule,
  getExamSchedules,

  // Publish setting endpoints
  createPublishSetting,
  getPublishSettings,
  updatePublishSetting,

  // Utility endpoints
  getClasses,
  getSubjects,
  getSubjectsByClass,
  getSections,
  getStudentsBySection,
  validateSchedule,
  checkAndPublishResults
};
