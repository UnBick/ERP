const Message = require('../../src/modules/communication/models/Message');
const mongoose = require('mongoose');
const Teacher = require('../../src/modules/staff/models/staffModel');
const Student = require('../../src/modules/student/models/studentModel');
const Parent = require('../../src/modules/parent/models/parentModel');

const seedMessages = async () => {
  try {
    // Fetch existing users
    const teachers = await Teacher.find({});
    const students = await Student.find({});
    const parents = await Parent.find({});

    const sampleMessages = [
      {
        subject: 'Welcome Message to Teachers',
        content: 'Welcome to our platform! We are excited to have you on board.',
        type: 'email',
        sender: {
          id: new mongoose.Types.ObjectId(),
          name: 'System Admin',
          role: 'admin',
        },
        recipients: teachers.map(teacher => ({
          id: teacher._id,
          name: teacher.name,
          role: 'teacher',
          read: false
        })),
        createdAt: new Date()
      },
      {
        subject: 'Welcome Message to Students',
        content: 'Welcome to our school! Get ready for an exciting year of learning.',
        type: 'portal',
        sender: {
          id: new mongoose.Types.ObjectId(),
          name: 'School Admin',
          role: 'admin',
        },
        recipients: students.map(student => ({
          id: student._id,
          name: `${student.personalInfo.firstName} ${student.personalInfo.lastName}`,
          role: 'student',
          read: false
        })),
        createdAt: new Date()
      },
      {
        subject: 'Important Announcement for Parents',
        content: 'Dear Parents, please note the upcoming school events.',
        type: 'sms',
        sender: {
          id: new mongoose.Types.ObjectId(),
          name: 'School Admin',
          role: 'admin',
        },
        recipients: parents.map(parent => ({
          id: parent._id,
          name: parent.name,
          role: 'parent',
          read: false
        })),
        createdAt: new Date()
      },
      // Add more sample messages as needed
    ];

    await Message.insertMany(sampleMessages);
    console.log('Sample messages seeded successfully');
  } catch (error) {
    console.error('Error seeding messages:', error);
  }
};

module.exports = seedMessages;