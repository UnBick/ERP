require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Class = require('../../src/modules/academic/models/classModel');
const Subject = require('../../src/modules/academic/models/subjectModel');

// Assuming you have an ExamType model - you'll need to create this
const ExamType = require('../../src/modules/exams/models/examTypeModel');

const examTypes = [
  {
    name: 'Mid Term Examination',
    shortName: 'MID',
    totalMarks: 80,
    duration: 180, // 3 hours in minutes
    applicableClasses: ['all'],
    exceptions: [
      {
        subjectCode: 'PHY101', // Physics will have different marks
        totalMarks: 70,
        duration: 150 // 2.5 hours
      }
    ]
  },
  {
    name: 'Final Examination',
    shortName: 'FINAL',
    totalMarks: 100,
    duration: 180,
    applicableClasses: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '11'], // Excluding 10th and 12th
    exceptions: [
      {
        subjectCode: 'PHY101',
        totalMarks: 85,
        duration: 180
      }
    ]
  },
  {
    name: 'Weekly Test',
    shortName: 'WEEKLY',
    totalMarks: 25,
    duration: 45,
    applicableClasses: ['all'],
    exceptions: [] // No exceptions for weekly tests
  },
  {
    name: 'Pre-Board Examination',
    shortName: 'PRE-BOARD',
    totalMarks: 100,
    duration: 180,
    applicableClasses: ['10', '12'], // Only for 10th and 12th
    exceptions: [
      {
        subjectCode: 'PHY101',
        totalMarks: 85,
        duration: 180
      }
    ]
  }
];

const seedExamTypes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing exam types
    await ExamType.deleteMany({});
    console.log('Cleared existing exam types');

    // Fetch all classes and subjects for reference
    const classes = await Class.find({});
    const subjects = await Subject.find({});

    // Process and create exam types
    for (const examType of examTypes) {
      const applicableClassIds = examType.applicableClasses[0] === 'all' 
        ? classes.map(c => c._id)
        : classes.filter(c => examType.applicableClasses.includes(c.name.split(' ')[1]))
            .map(c => c._id);

      // Process exceptions
      const processedExceptions = examType.exceptions.map(exception => {
        const subject = subjects.find(s => s.code === exception.subjectCode);
        return {
          subject: subject._id,
          totalMarks: exception.totalMarks,
          duration: exception.duration
        };
      });

      await ExamType.create({
        name: examType.name,
        shortName: examType.shortName,
        totalMarks: examType.totalMarks,
        duration: examType.duration,
        applicableClasses: applicableClassIds,
        exceptions: processedExceptions,
        isActive: true,
        academicYear: '2024-2025'
      });

      console.log(`Created exam type: ${examType.name}`);
    }

    console.log('Exam types seeding completed successfully');
    await mongoose.connection.close();

  } catch (error) {
    console.error('Error seeding exam types:', error);
    if (mongoose.connection) await mongoose.connection.close();
  }
};

// Handle interruptions
process.on('SIGINT', async () => {
  if (mongoose.connection) await mongoose.connection.close();
  process.exit(0);
});

seedExamTypes();
