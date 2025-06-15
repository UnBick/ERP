require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Teacher = require('../../src/modules/staff/models/staffModel');
const Student = require('../../src/modules/student/models/studentModel');
const Parent = require('../../src/modules/parent/models/parentModel');
const User = require('../../src/modules/auth/models/userModel');
const Class = require('../../src/modules/academic/models/classModel');
const Section = require('../../src/modules/academic/models/sectionModel');
const Subject = require('../../src/modules/academic/models/subjectModel');

// Array definitions
const firstNames = [ 'Aiden', 'Sofia', 'Mohammed', 'Yuki', 'Isabella', 
  'Lucas', 'Elena', 'Chen', 'Aisha', 'Alexander',
  'Priya', 'Gabriel', 'Emma', 'Liam', 'Zara',
  'Oliver', 'Ava', 'Mateo', 'Nina', 'Kai',
  'Sophia', 'Leo', 'Maya', 'Noah', 'Luna',
  'Ethan', 'Ana', 'Rafael', 'Mia', 'David',
  'Aria', 'Diego', 'Sarah', 'Adam', 'Lily',
  'Hassan', 'Emilia', 'Marcus', 'Leah', 'Daniel',
  'Chloe', 'Xavier', 'Nora', 'Felix', 'Amara',
  'Samuel', 'Zoe', 'Isaac', 'Eva', 'Benjamin'];
const lastNames = ['Smith', 'Patel', 'Kim', 'Garcia', 'Müller',
    'Chen', 'Silva', 'Kumar', 'Tanaka', 'Anderson',
    'Murphy', 'Singh', 'Lee', 'Rodriguez', 'Schmidt',
    'Wang', 'Santos', 'Ali', 'Sato', 'Brown',
    'O\'Connor', 'Gupta', 'Park', 'Martinez', 'Weber',
    'Liu', 'Ferreira', 'Khan', 'Yamamoto', 'Wilson',
    'McCarthy', 'Sharma', 'Choi', 'Hernandez', 'Fischer',
    'Zhang', 'Costa', 'Hassan', 'Suzuki', 'Taylor',
    'Ryan', 'Verma', 'Jung', 'Lopez', 'Becker',
    'Wu', 'Almeida', 'Ahmed', 'Kato', 'Johnson'];
const departments = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physical Education'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Others'];
const categories = ['General', 'OBC', 'SC', 'ST', 'Others'];
const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
const motherTongues = ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu'];

// Utility functions
const generatePhoneNumber = () => Math.floor(Math.random() * 9000000000 + 1000000000).toString();
const generateEmail = (name, index) => `${name.toLowerCase().replace(/\s/g, '.')}.${index}@school.com`;
const generateAddress = () => {
    const streets = ['Main Street', 'Park Road', 'School Lane', 'Temple Road', 'Market Street'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal'];
    return `${Math.floor(Math.random() * 100 + 1)}, ${streets[Math.floor(Math.random() * streets.length)]}, 
            ${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]}`;
};

const generateEnrollmentNumber = (year, index) => `EN${year}${index.toString().padStart(3, '0')}`;
const generateStaffID = (index) => `ST${index.toString().padStart(3, '0')}`;

// Helper functions
const createUser = async (email, role, name) => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const username = email.split('@')[0];
    return await User.create({ username, email, password: hashedPassword, role, name, isActive: true });
};

const createParentWithUser = async (parentData, index) => {
    const parentEmail = generateEmail(`${parentData.lastName}.parent`, index);
    const parentUser = await createUser(parentEmail, 'parent', parentData.name);
    
    return await Parent.create({
        user: parentUser._id,
        name: parentData.name,
        email: parentEmail,
        contact: generatePhoneNumber(),
        alternateContact: generatePhoneNumber(),
        address: generateAddress(),
        occupation: ['Business', 'Service', 'Professional', 'Other'][Math.floor(Math.random() * 4)],
        education: ['Graduate', 'Post Graduate', 'Doctorate', 'Other'][Math.floor(Math.random() * 4)],
        annualIncome: Math.floor(Math.random() * 1000000 + 500000),
        employer: ['Self Employed', 'Private Sector', 'Public Sector', 'Government'][Math.floor(Math.random() * 4)],
        officeAddress: generateAddress(),
        relationship: ['Father', 'Mother', 'Guardian'][Math.floor(Math.random() * 3)],
        emergencyContact: {
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            relationship: ['Uncle', 'Aunt', 'Grandparent'][Math.floor(Math.random() * 3)],
            contact: generatePhoneNumber(),
            address: generateAddress()
        },
        isActive: true,
        maritalStatus: ['Married', 'Single', 'Divorced', 'Widowed'][Math.floor(Math.random() * 4)],
        nationality: 'Indian',
        religion: religions[Math.floor(Math.random() * religions.length)],
        category: categories[Math.floor(Math.random() * categories.length)]
    });
};

// Cleanup function
const cleanup = async () => {
    console.log('Cleaning up...');
    if (mongoose.connection) await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
};

// Handle interruptions
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Main seeding function
const seedDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            Teacher.deleteMany({}),
            Student.deleteMany({}),
            Parent.deleteMany({}),
            Class.deleteMany({}),
            Section.deleteMany({}),
            Subject.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Create classes with proper levels
        const classStructure = [
            { level: 'Primary', classes: ['1', '2', '3', '4', '5'] },
            { level: 'Middle', classes: ['6', '7', '8'] },
            { level: 'Secondary', classes: ['9', '10'] },
            { level: 'Higher Secondary', classes: ['11', '12'] }
        ];

        const classes = [];
        for (const structure of classStructure) {
            for (const className of structure.classes) {
                const cls = await Class.create({
                    name: `Class ${className}`,
                    level: structure.level,
                    capacity: 90,
                    academicYear: '2024-2025'
                });
                classes.push(cls);
            }
        }
        console.log(`Created ${classes.length} classes`);

        // Update the subjects array in your seeder
const subjects = [
  { 
      name: 'Mathematics',
      code: 'MATH101',
      level: 'all',
      department: 'Mathematics',
      isElective: false,
      description: 'Core mathematics curriculum'
  },
  { 
      name: 'Science',
      code: 'SCI101',
      level: ['Primary', 'Middle'],
      department: 'Science',
      isElective: false,
      description: 'General science for junior classes'
  },
  { 
      name: 'English',
      code: 'ENG101',
      level: 'all',
      department: 'English',
      isElective: false,
      description: 'Core English language and literature'
  },
  { 
      name: 'History',
      code: 'HIS101',
      level: 'all',
      department: 'History',
      isElective: false,
      description: 'World and Indian history'
  },
  { 
      name: 'Geography',
      code: 'GEO101',
      level: 'all',
      department: 'Geography',
      isElective: false,
      description: 'Physical and political geography'
  },
  { 
      name: 'Physics',
      code: 'PHY101',
      level: ['Secondary', 'Higher Secondary'],
      department: 'Science',
      isElective: false,
      description: 'Advanced physics'
  },
  { 
      name: 'Chemistry',
      code: 'CHEM101',
      level: ['Secondary', 'Higher Secondary'],
      department: 'Science',
      isElective: false,
      description: 'Advanced chemistry'
  },
  { 
      name: 'Biology',
      code: 'BIO101',
      level: ['Secondary', 'Higher Secondary'],
      department: 'Science',
      isElective: false,
      description: 'Advanced biology'
  },
  { 
      name: 'Hindi',
      code: 'HIN101',
      level: 'all',
      department: 'History',
      isElective: false,
      description: 'Hindi language and literature'
  },
  { 
      name: 'Music',
      code: 'MUC101',
      level: ['Primary', 'Middle'],
      department: 'History',
      isElective: true,
      description: 'Music and performing arts'
  },
  { 
      name: 'Fine Art',
      code: 'FIN101',
      level: ['Primary', 'Middle'],
      department: 'History',
      isElective: true,
      description: 'Visual arts and crafts'
  },
  { 
      name: 'German',
      code: 'GER101',
      level: ['Secondary', 'Higher Secondary'],
      department: 'English',
      isElective: true,
      description: 'German language'
  },
  { 
      name: 'Arts',
      code: 'ARTS101',
      level: ['Primary', 'Middle'],
      department: 'History',
      isElective: true,
      description: 'Creative arts and design'
  }
].map(subject => ({
  ...subject,
  isActive: true
}));

// Create subjects
const createdSubjects = await Subject.create(subjects);
console.log(`Created ${createdSubjects.length} subjects`);


        // Create sections
        const sections = ['A', 'B', 'C'];
        const createdSections = [];
        for (const cls of classes) {
            for (const sectionName of sections) {
                const section = await Section.create({
                    name: sectionName,
                    class: cls._id,
                    capacity: 30
                });
                createdSections.push(section);
            }
        }
        console.log(`Created ${createdSections.length} sections`);

        // Helper function to get subjects for a class level
        const getSubjectsForLevel = (level) => {
            return createdSubjects.filter(subject => 
                subject.level === 'all' || 
                (Array.isArray(subject.level) && subject.level.includes(level))
            ).map(s => s._id);
        };

        // Create teachers
        const teachers = [];
        for (let i = 1; i <= 25; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const teacherName = `${firstName} ${lastName}`;
            const teacherEmail = generateEmail(teacherName, i);
            
            const teacherUser = await createUser(teacherEmail, 'teacher', teacherName);
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            const possibleSections = createdSections.filter(s => s.class.equals(randomClass._id));
            const randomSection = possibleSections[Math.floor(Math.random() * possibleSections.length)];
            const possibleSubjects = getSubjectsForLevel(randomClass.level);
            const randomSubject = possibleSubjects[Math.floor(Math.random() * possibleSubjects.length)];

            const teacher = await Teacher.create({
                user: teacherUser._id,
                name: teacherName,
                staffID: generateStaffID(i),
                email: teacherEmail,
                contact: generatePhoneNumber(),
                department: departments[Math.floor(Math.random() * departments.length)],
                designation: 'Teacher',
                class: randomClass._id,
                section: randomSection._id,
                subject: randomSubject,
                address: generateAddress(),
                dateOfBirth: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                religion: religions[Math.floor(Math.random() * religions.length)],
                category: categories[Math.floor(Math.random() * categories.length)],
                qualifications: 'MSc, BEd',
                joiningDate: new Date(2010 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                isActive: true,
                mobileNo: generatePhoneNumber(),
                nationality: 'Indian',
                salary: Math.floor(Math.random() * 50000 + 30000)
            });
            
            teachers.push(teacher);
            console.log(`Created teacher: ${teacher.name}`);
        }

        // Create students and parents
        const adminId = new mongoose.Types.ObjectId();
        const currentYear = new Date().getFullYear();
        let studentCounter = 1;
        const batchSize = 50;
        let studentBatch = [];

        for (const cls of classes) {
            for (const section of createdSections.filter(s => s.class.equals(cls._id))) {
                for (let i = 1; i <= section.capacity; i++) {
                    try {
                        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                        const enrollmentNumber = generateEnrollmentNumber(currentYear, studentCounter);
                        
                        const parent = await createParentWithUser({
                            name: `${lastName} Parent`,
                            lastName
                        }, studentCounter);

                        const studentEmail = generateEmail(`${firstName}.${lastName}`, studentCounter);
                        const studentUser = await createUser(studentEmail, 'student', `${firstName} ${lastName}`);

                        const studentData = {
                            enrollmentNumber,
                            user: studentUser._id,
                            personalInfo: {
                                firstName,
                                lastName,
                                dateOfBirth: new Date(2005 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                                gender: Math.random() > 0.5 ? 'Male' : 'Female',
                                religion: religions[Math.floor(Math.random() * religions.length)],
                                category: categories[Math.floor(Math.random() * categories.length)],
                                nationality: 'Indian',
                                placeOfBirth: 'Mumbai',
                                bloodGroup: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
                                motherTongue: motherTongues[Math.floor(Math.random() * motherTongues.length)]
                            },
                            academicInfo: {
                                class: cls._id,
                                section: section._id,
                                rollNumber: `${cls.name.slice(-1)}${section.name}${i.toString().padStart(2, '0')}`,
                                subjects: getSubjectsForLevel(cls.level)
                            },
                            contactInfo: {
                                email: studentEmail,
                                phone: generatePhoneNumber(),
                                address: generateAddress(),
                                guardianName: parent.name,
                                guardianContact: parent.contact
                            },
                            parent: parent._id,
                            createdBy: adminId,
                            isActive: true
                        };

                        studentBatch.push(studentData);
                        
                        if (studentBatch.length >= batchSize) {
                            await Student.insertMany(studentBatch);
                            studentBatch = [];
                        }

                        await Parent.findByIdAndUpdate(parent._id, { $push: { children: studentData._id } });
                        
                        console.log(`Created student: ${firstName} ${lastName} in ${cls.name}-${section.name}`);
                        studentCounter++;
                    } catch (error) {
                        console.error(`Error creating student in ${cls.name}-${section.name}:`, error);
                    }
                }
            }
        }

        // Insert any remaining students
        if (studentBatch.length > 0) {
            await Student.insertMany(studentBatch);
        }

        console.log('Database seeding completed successfully');
        await cleanup();

    } catch (error) {
        console.error('Error seeding database:', error);
        await cleanup();
    }
};

seedDatabase();