// Script to print all seeded classes and teachers/staff (read-only, safe for production)

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Import models
const Class = require('../src/modules/academic/models/classModel');
//const Teacher = require('../src/modules/teacher/models/teacherModel');
const Staff = require('../src/modules/staff/models/staffModel'); // Import staff model
const Teacher = require('../src/modules/staff/models/staffModel'); // Import teacher model

async function printSeededData() {
  let connection;
  try {
    connection = await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB\n');



    // --- Update Teachers: Remove "levels" and set "level" randomly ---
    const allowedLevels = ['Primary', 'Middle', 'Secondary', 'Higher Secondary'];
    const teachers = await Teacher.find({});
    let updatedTeacherCount = 0;
    for (const t of teachers) {
      // Remove "levels" and set "level" randomly
      const randomLevel = allowedLevels[Math.floor(Math.random() * allowedLevels.length)];
      t.level = randomLevel;
      t.levels = undefined;

      // --- FIX: Use updateOne to avoid VersionError ---
      let salaryObj = {};
      if (typeof t.salary === 'number') {
        salaryObj = { basicPay: t.salary };
      } else if (!t.salary || typeof t.salary !== 'object') {
        salaryObj = { basicPay: 30000 };
      } else if (typeof t.salary.basicPay !== 'number' || isNaN(t.salary.basicPay)) {
        salaryObj = { ...t.salary, basicPay: 30000 };
      } else {
        salaryObj = t.salary;
      }

      await Teacher.updateOne(
        { _id: t._id },
        {
          $set: {
            level: randomLevel,
            salary: salaryObj
          },
          $unset: { levels: "" }
        }
      );
      updatedTeacherCount++;
    }
    if (updatedTeacherCount > 0) {
      console.log(`Updated ${updatedTeacherCount} teachers: removed "levels" and set random "level".`);
    }

    // Print Teachers/Staff
    const teachersAfter = await Teacher.find({}).lean();
    console.log('--- Teachers/Staff ---');
    teachersAfter.forEach(t => {
      // Always print the actual value of t.level, and show a warning if it's missing
      let level = (typeof t.level === 'string' && t.level.trim()) ? t.level : '[MISSING]';
      if (level === '[MISSING]') {
        console.warn(`WARNING: Teacher ${t.name} (${t._id}) has no level set!`);
      }
      // List all fields except salary/salaryDetails, and REMOVE class/section, but ADD level
      const {
        _id, name, staffID, email, contact, mobileNo, department, designation,
        address, dateOfBirth, gender, religion, category, qualifications,
        joiningDate, nationality, subject, isActive,
        user, roles, isClassTeacher, classTeacherFor, primaryClass, primarySection
      } = t;
      console.log(
        `- ${name} | StaffID: ${staffID || ''} | Email: ${email || ''} | Contact: ${contact || ''} | Mobile: ${mobileNo || ''} | Department: ${department || ''} | Designation: ${designation || ''} | Address: ${address || ''} | DOB: ${dateOfBirth ? dateOfBirth.toISOString().slice(0,10) : ''} | Gender: ${gender || ''} | Religion: ${religion || ''} | Category: ${category || ''} | Qualifications: ${qualifications || ''} | Joining: ${joiningDate ? joiningDate.toISOString().slice(0,10) : ''} | Nationality: ${nationality || ''} | Subject: ${subject || ''} | Active: ${isActive} | User: ${user || ''} | Roles: ${roles ? roles.join(',') : ''} | IsClassTeacher: ${isClassTeacher} | ClassTeacherFor: ${classTeacherFor || ''} | PrimaryClass: ${primaryClass || ''} | PrimarySection: ${primarySection || ''} | Level: ${level}`
      );
    });
    console.log(`Total Teachers/Staff: ${teachersAfter.length}\n`);

    await mongoose.connection.close();
    console.log('Done.');
  } catch (err) {
    console.error('Error:', err);
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

printSeededData();
