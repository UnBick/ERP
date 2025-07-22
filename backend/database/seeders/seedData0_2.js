// Merged Seeder: Teachers (with level), Classes, Sections, Students, Parents
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

// --- Utility Arrays ---
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Dhruv', 'Kabir', 'Rudra', 'Ansh', 'Aryan', 'Rohan', 'Ayaan', 'Om',
  'Saanvi', 'Aadhya', 'Ananya', 'Pari', 'Diya', 'Myra', 'Ira', 'Aarohi', 'Anika', 'Navya',
  'Advika', 'Ishita', 'Prisha', 'Riya', 'Aanya', 'Sara', 'Meera', 'Vanya', 'Aaradhya', 'Kiara',
  'Tanishka', 'Mishka', 'Saanvika', 'Amaira', 'Aarya', 'Anvi', 'Lavanya', 'Charvi', 'Ahaana', 'Jiya'
];
const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Singh', 'Gupta', 'Mehta', 'Jain', 'Agarwal',
  'Kumar', 'Das', 'Choudhary', 'Yadav', 'Rao', 'Joshi', 'Mishra', 'Pandey', 'Saxena', 'Kapoor',
  'Bhat', 'Shetty', 'Pillai', 'Menon', 'Iyer', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Ghosh', 'Dutta',
  'Saha', 'Roy', 'Paul', 'Sen', 'Bose', 'Chakraborty', 'Bhattacharya', 'Tripathi', 'Srivastava', 'Dubey',
  'Rastogi', 'Goel', 'Aggarwal', 'Malhotra', 'Grover', 'Sethi', 'Kohli', 'Gill', 'Sidhu', 'Ahluwalia'
];
const departments = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physical Education'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Others'];
const categories = ['General', 'OBC', 'SC', 'ST', 'Others'];
const bloodGroups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'];
const motherTongues = ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu'];
const allowedLevels = ['Primary', 'Middle', 'Secondary', 'Higher Secondary'];

// --- Utility Functions ---
const generatePhoneNumber = () => Math.floor(Math.random() * 9000000000 + 1000000000).toString();
const generateEmail = (name, index) => `${name.toLowerCase().replace(/\s/g, '.')}.${index}@school.com`;
const generateAddress = () => {
    const streets = ['Main Street', 'Park Road', 'School Lane', 'Temple Road', 'Market Street'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal'];
    return `${Math.floor(Math.random() * 100 + 1)}, ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}, ${states[Math.floor(Math.random() * states.length)]}`;
};
const generateEnrollmentNumber = (year, index) => `EN${year}${index.toString().padStart(3, '0')}`;
const generateStaffID = (index) => `ST${index.toString().padStart(3, '0')}`;

// --- Subject/Department Mapping (from seedTeacher.js) ---
const departmentSubjectMapping = {
    'Mathematics': {
        subjects: ['Mathematics'],
        level: ['primary', 'middle', 'secondary', 'higher secondary']
    },
    'Science': {
        subjects: ['General Science', 'Physics', 'Chemistry', 'Biology'],
        level: {
            'General Science': ['primary', 'middle'],
            'Physics': ['secondary', 'higher secondary'],
            'Chemistry': ['secondary', 'higher secondary'],
            'Biology': ['secondary', 'higher secondary']
        }
    },
    'Arts': {
        subjects: ['History', 'Civics', 'Geography', 'Political Science', 'Economics'],
        level: {
            'History': ['primary', 'middle', 'secondary', 'higher secondary'],
            'Civics': ['middle', 'secondary', 'higher secondary'],
            'Geography': ['primary', 'middle', 'secondary', 'higher secondary'],
            'Political Science': ['secondary', 'higher secondary'],
            'Economics': ['secondary', 'higher secondary']
        }
    },
    'Languages': {
        subjects: ['English', 'Hindi', 'Sanskrit'],
        level: ['primary', 'middle', 'secondary', 'higher secondary']
    },
    'Physical Education': {
        subjects: ['Physical Education'],
        level: ['primary', 'middle', 'secondary', 'higher secondary']
    },
    'Fine Arts': {
        subjects: ['Drawing', 'Music', 'Dance'],
        level: ['primary', 'middle', 'secondary', 'higher secondary']
    },
    'Computer Science': {
        subjects: ['Computer Science'],
        level: ['middle', 'secondary', 'higher secondary']
    },
    'Commerce': {
        subjects: ['Accountancy', 'Business Studies'],
        level: ['secondary', 'higher secondary']
    },
    'Home Science': {
        subjects: ['Home Science'],
        level: ['middle', 'secondary', 'higher secondary']
    }
};

// --- Teacher Data (from seedTeacher.js) ---
const teacherData = [
    {
        name: 'Dr. Rajesh Kumar',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@school.edu',
        phone: '9876543210',
        department: 'Mathematics',
        specialization: ['Mathematics'], // Subject specialization
        qualification: 'M.Sc Mathematics, B.Ed',
        experience: 15,
        salary: 45000,
        joiningDate: new Date('2020-01-15'),
        address: {
            street: '123 Teachers Colony',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800001'
        },
        emergencyContact: {
            name: 'Sunita Kumar',
            phone: '9876543211',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Priya Sharma',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@school.edu',
        phone: '9876543212',
        department: 'Languages',
        specialization: ['English'], // Only English as specialization
        subjects: ['English'],       // Only English as subject
        qualification: 'M.A English Literature, B.Ed',
        experience: 12,
        salary: 42000,
        joiningDate: new Date('2019-06-01'),
        address: {
            street: '456 Boring Road',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800001'
        },
        emergencyContact: {
            name: 'Amit Sharma',
            phone: '9876543213',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mr. Sunil Singh',
        firstName: 'Sunil',
        lastName: 'Singh',
        email: 'sunil.singh@school.edu',
        phone: '9876543214',
        department: 'Science',
        specialization: ['Physics'], // Physics specialist
        qualification: 'M.Sc Physics, B.Ed',
        experience: 18,
        salary: 48000,
        joiningDate: new Date('2018-03-10'),
        address: {
            street: '789 Kankarbagh',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800020'
        },
        emergencyContact: {
            name: 'Rekha Singh',
            phone: '9876543215',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Ms. Anita Devi',
        firstName: 'Anita',
        lastName: 'Devi',
        email: 'anita.devi@school.edu',
        phone: '9876543216',
        department: 'Arts',
        specialization: ['History', 'Civics'], // Multiple subjects
        qualification: 'M.A History, B.Ed',
        experience: 10,
        salary: 40000,
        joiningDate: new Date('2021-07-01'),
        address: {
            street: '321 Patliputra Colony',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800013'
        },
        emergencyContact: {
            name: 'Ram Devi',
            phone: '9876543217',
            relationship: 'Father'
        }
    },
    {
        name: 'Mr. Ravi Gupta',
        firstName: 'Ravi',
        lastName: 'Gupta',
        email: 'ravi.gupta@school.edu',
        phone: '9876543218',
        department: 'Physical Education',
        specialization: ['Physical Education'],
        qualification: 'M.P.Ed, B.P.Ed',
        experience: 8,
        salary: 38000,
        joiningDate: new Date('2022-04-15'),
        address: {
            street: '654 Rajiv Nagar',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800016'
        },
        emergencyContact: {
            name: 'Sita Gupta',
            phone: '9876543219',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Kavita Jha',
        firstName: 'Kavita',
        lastName: 'Jha',
        email: 'kavita.jha@school.edu',
        phone: '9876543220',
        department: 'Languages',
        specialization: ['Hindi', 'Sanskrit'], // Hindi & Sanskrit specialist
        qualification: 'M.A Hindi, B.Ed',
        experience: 14,
        salary: 43000,
        joiningDate: new Date('2019-08-20'),
        address: {
            street: '987 Kumhrar',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800026'
        },
        emergencyContact: {
            name: 'Vinod Jha',
            phone: '9876543221',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mr. Ashok Pandey',
        firstName: 'Ashok',
        lastName: 'Pandey',
        email: 'ashok.pandey@school.edu',
        phone: '9876543222',
        department: 'Computer Science',
        specialization: ['Computer Science'],
        qualification: 'MCA, B.Ed',
        experience: 6,
        salary: 45000,
        joiningDate: new Date('2023-01-10'),
        address: {
            street: '147 Danapur',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '801503'
        },
        emergencyContact: {
            name: 'Meera Pandey',
            phone: '9876543223',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Sunita Mishra',
        firstName: 'Sunita',
        lastName: 'Mishra',
        email: 'sunita.mishra@school.edu',
        phone: '9876543224',
        department: 'Fine Arts',
        specialization: ['Drawing', 'Music'], // Art specialist
        qualification: 'M.A Fine Arts, B.Ed',
        experience: 9,
        salary: 39000,
        joiningDate: new Date('2022-06-01'),
        address: {
            street: '258 Digha',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800011'
        },
        emergencyContact: {
            name: 'Raj Mishra',
            phone: '9876543225',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mr. Deepak Rai',
        firstName: 'Deepak',
        lastName: 'Rai',
        email: 'deepak.rai@school.edu',
        phone: '9876543226',
        department: 'Commerce',
        specialization: ['Accountancy', 'Business Studies'], // Commerce specialist
        qualification: 'M.Com, B.Ed',
        experience: 11,
        salary: 41000,
        joiningDate: new Date('2020-09-15'),
        address: {
            street: '369 Budh Marg',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800001'
        },
        emergencyContact: {
            name: 'Pooja Rai',
            phone: '9876543227',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Geeta Thakur',
        firstName: 'Geeta',
        lastName: 'Thakur',
        email: 'geeta.thakur@school.edu',
        phone: '9876543228',
        department: 'Home Science',
        specialization: ['Home Science'],
        qualification: 'M.Sc Home Science, B.Ed',
        experience: 7,
        salary: 37000,
        joiningDate: new Date('2023-03-20'),
        address: {
            street: '741 Boring Canal Road',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800001'
        },
        emergencyContact: {
            name: 'Manoj Thakur',
            phone: '9876543229',
            relationship: 'Spouse'
        }
    },
    // Additional Science teachers with specific specializations
    {
        name: 'Dr. Anil Verma',
        firstName: 'Anil',
        lastName: 'Verma',
        email: 'anil.verma@school.edu',
        phone: '9876543230',
        department: 'Science',
        specialization: ['Chemistry'], // Chemistry specialist
        qualification: 'Ph.D Chemistry, M.Sc, B.Ed',
        experience: 20,
        salary: 55000,
        joiningDate: new Date('2017-01-05'),
        address: {
            street: '852 Anisabad',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800002'
        },
        emergencyContact: {
            name: 'Sushma Verma',
            phone: '9876543231',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Reena Kumari',
        firstName: 'Reena',
        lastName: 'Kumari',
        email: 'reena.kumari@school.edu',
        phone: '9876543232',
        department: 'Mathematics',
        specialization: ['Mathematics'],
        qualification: 'M.Sc Mathematics, B.Ed',
        experience: 13,
        salary: 44000,
        joiningDate: new Date('2019-02-15'),
        address: {
            street: '963 Saguna More',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800014'
        },
        emergencyContact: {
            name: 'Rajesh Kumari',
            phone: '9876543233',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mr. Vikash Choudhary',
        firstName: 'Vikash',
        lastName: 'Choudhary',
        email: 'vikash.choudhary@school.edu',
        phone: '9876543234',
        department: 'Languages',
        specialization: ['English'], // English specialist
        qualification: 'M.A English, B.Ed',
        experience: 5,
        salary: 35000,
        joiningDate: new Date('2024-01-08'),
        address: {
            street: '159 Kurji',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800010'
        },
        emergencyContact: {
            name: 'Puja Choudhary',
            phone: '9876543235',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Neha Sinha',
        firstName: 'Neha',
        lastName: 'Sinha',
        email: 'neha.sinha@school.edu',
        phone: '9876543236',
        department: 'Arts',
        specialization: ['Geography'], // Geography specialist
        qualification: 'M.A Geography, B.Ed',
        experience: 8,
        salary: 38000,
        joiningDate: new Date('2022-08-12'),
        address: {
            street: '753 Mithapur',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800001'
        },
        emergencyContact: {
            name: 'Rohit Sinha',
            phone: '9876543237',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Dr. Santosh Kumar',
        firstName: 'Santosh',
        lastName: 'Kumar',
        email: 'santosh.kumar@school.edu',
        phone: '9876543238',
        department: 'Science',
        specialization: ['Biology'], // Biology specialist
        qualification: 'Ph.D Biology, M.Sc, B.Ed',
        experience: 16,
        salary: 52000,
        joiningDate: new Date('2018-05-18'),
        address: {
            street: '357 Bypass Road',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800023'
        },
        emergencyContact: {
            name: 'Mamta Kumar',
            phone: '9876543239',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mr. Ramesh Gupta',
        firstName: 'Ramesh',
        lastName: 'Gupta',
        email: 'ramesh.gupta@school.edu',
        phone: '9876543240',
        department: 'Arts',
        specialization: ['Political Science'], // Political Science specialist
        qualification: 'M.A Political Science, B.Ed',
        experience: 9,
        salary: 39000,
        joiningDate: new Date('2021-11-10'),
        address: {
            street: '486 Gardanibagh',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800002'
        },
        emergencyContact: {
            name: 'Shanti Gupta',
            phone: '9876543241',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Manju Devi',
        firstName: 'Manju',
        lastName: 'Devi',
        email: 'manju.devi@school.edu',
        phone: '9876543242',
        department: 'Arts',
        specialization: ['Economics'], // Economics specialist
        qualification: 'M.A Economics, B.Ed',
        experience: 11,
        salary: 41000,
        joiningDate: new Date('2020-03-25'),
        address: {
            street: '219 Sheikhpura',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800014'
        },
        emergencyContact: {
            name: 'Suresh Devi',
            phone: '9876543243',
            relationship: 'Spouse'
        }
    },
    // Additional Science teacher for General Science
    {
        name: 'Mrs. Priyanka Sharma',
        firstName: 'Priyanka',
        lastName: 'Sharma',
        email: 'priyanka.sharma1@school.edu',
        phone: '9876543244',
        department: 'Science',
        specialization: ['General Science'], // General Science specialist for primary/middle
        qualification: 'M.Sc, B.Ed',
        experience: 7,
        salary: 38000,
        joiningDate: new Date('2022-07-15'),
        address: {
            street: '125 Ashok Nagar',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800025'
        },
        emergencyContact: {
            name: 'Ajay Sharma',
            phone: '9876543245',
            relationship: 'Spouse'
        }
    },
    // Additional Fine Arts teacher
    {
        name: 'Mr. Ajay Singh',
        firstName: 'Ajay',
        lastName: 'Singh',
        email: 'ajay.singh@school.edu',
        phone: '9876543246',
        department: 'Fine Arts',
        specialization: ['Dance'], // Dance specialist
        qualification: 'M.A Dance, Diploma in Classical Dance',
        experience: 6,
        salary: 36000,
        joiningDate: new Date('2023-02-20'),
        address: {
            street: '678 Kadam Kuan',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800003'
        },
        emergencyContact: {
            name: 'Ritu Singh',
            phone: '9876543247',
            relationship: 'Spouse'
        }
    },
    // Fixed additional teachers with proper departments and specializations
    {
        name: 'Ms. Ritu Sinha',
        firstName: 'Ritu',
        lastName: 'Sinha',
        email: 'ritu.sinha@school.edu',
        phone: '9876543248',
        department: 'Mathematics',
        specialization: ['Mathematics'],
        qualification: 'M.Sc Mathematics, B.Ed',
        experience: 7,
        salary: 39000,
        joiningDate: new Date('2021-09-01'),
        address: {
            street: '101 Gandhi Nagar',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800003'
        },
        emergencyContact: {
            name: 'Amit Sinha',
            phone: '9876543249',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mr. Ajay Kumar',
        firstName: 'Ajay',
        lastName: 'Kumar',
        email: 'ajay.kumar@school.edu',
        phone: '9876543250',
        department: 'Science',
        specialization: ['Biology'],
        qualification: 'M.Sc Biology, B.Ed',
        experience: 9,
        salary: 41000,
        joiningDate: new Date('2020-11-15'),
        address: {
            street: '202 Rajendra Nagar',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800004'
        },
        emergencyContact: {
            name: 'Sunita Kumar',
            phone: '9876543251',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Shalini Verma',
        firstName: 'Shalini',
        lastName: 'Verma',
        email: 'shalini.verma@school.edu',
        phone: '9876543252',
        department: 'Languages',
        specialization: ['English'],
        qualification: 'M.A English, B.Ed',
        experience: 8,
        salary: 40000,
        joiningDate: new Date('2022-01-10'),
        address: {
            street: '303 Fraser Road',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800005'
        },
        emergencyContact: {
            name: 'Rakesh Verma',
            phone: '9876543253',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mr. Manoj Tiwari',
        firstName: 'Manoj',
        lastName: 'Tiwari',
        email: 'manoj.tiwari@school.edu',
        phone: '9876543254',
        department: 'Arts',
        specialization: ['Geography'],
        qualification: 'M.A Geography, B.Ed',
        experience: 10,
        salary: 42000,
        joiningDate: new Date('2019-10-05'),
        address: {
            street: '404 Exhibition Road',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800006'
        },
        emergencyContact: {
            name: 'Meena Tiwari',
            phone: '9876543255',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Ms. Priyanka Sharma',
        firstName: 'Priyanka',
        lastName: 'Sharma',
        email: 'priyanka.sharma2@school.edu',
        phone: '9876543256',
        department: 'Science',
        specialization: ['Chemistry'],
        qualification: 'M.Sc Chemistry, B.Ed',
        experience: 6,
        salary: 38000,
        joiningDate: new Date('2023-02-20'),
        address: {
            street: '505 Boring Road',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800007'
        },
        emergencyContact: {
            name: 'Vikas Sharma',
            phone: '9876543257',
            relationship: 'Brother'
        }
    },
    {
        name: 'Mr. Suresh Prasad',
        firstName: 'Suresh',
        lastName: 'Prasad',
        email: 'suresh.prasad@school.edu',
        phone: '9876543258',
        department: 'Physical Education',
        specialization: ['Physical Education'],
        qualification: 'M.P.Ed, B.P.Ed',
        experience: 11,
        salary: 43000,
        joiningDate: new Date('2018-12-01'),
        address: {
            street: '606 Bailey Road',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800008'
        },
        emergencyContact: {
            name: 'Anita Prasad',
            phone: '9876543259',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Anjali Singh',
        firstName: 'Anjali',
        lastName: 'Singh',
        email: 'anjali.singh@school.edu',
        phone: '9876543260',
        department: 'Fine Arts',
        specialization: ['Drawing'],
        qualification: 'M.A Fine Arts, B.Ed',
        experience: 5,
        salary: 37000,
        joiningDate: new Date('2022-05-15'),
        address: {
            street: '707 Ashiana Nagar',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800009'
        },
        emergencyContact: {
            name: 'Rohit Singh',
            phone: '9876543261',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mr. Deepak Mishra',
        firstName: 'Deepak',
        lastName: 'Mishra',
        email: 'deepak.mishra@school.edu',
        phone: '9876543262',
        department: 'Computer Science',
        specialization: ['Computer Science'],
        qualification: 'MCA, B.Ed',
        experience: 7,
        salary: 44000,
        joiningDate: new Date('2021-03-10'),
        address: {
            street: '808 Kankarbagh',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800010'
        },
        emergencyContact: {
            name: 'Seema Mishra',
            phone: '9876543263',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Ms. Richa Jaiswal',
        firstName: 'Richa',
        lastName: 'Jaiswal',
        email: 'richa.jaiswal@school.edu',
        phone: '9876543264',
        department: 'Languages',
        specialization: ['Hindi'],
        qualification: 'M.A Hindi, B.Ed',
        experience: 4,
        salary: 36000,
        joiningDate: new Date('2023-06-01'),
        address: {
            street: '909 Patliputra Colony',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800011'
        },
        emergencyContact: {
            name: 'Amit Jaiswal',
            phone: '9876543265',
            relationship: 'Brother'
        }
    },
    {
        name: 'Mr. Rajiv Ranjan',
        firstName: 'Rajiv',
        lastName: 'Ranjan',
        email: 'rajiv.ranjan@school.edu',
        phone: '9876543266',
        department: 'Commerce',
        specialization: ['Business Studies'],
        qualification: 'M.Com, B.Ed',
        experience: 12,
        salary: 45000,
        joiningDate: new Date('2017-08-25'),
        address: {
            street: '1010 Buddha Colony',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800012'
        },
        emergencyContact: {
            name: 'Sunita Ranjan',
            phone: '9876543267',
            relationship: 'Spouse'
        }
    },
    {
        name: 'Mrs. Meena Kumari',
        firstName: 'Meena',
        lastName: 'Kumari',
        email: 'meena.kumari@school.edu',
        phone: '9876543268',
        department: 'Home Science',
        specialization: ['Home Science'],
        qualification: 'M.Sc Home Science, B.Ed',
        experience: 9,
        salary: 42000,
        joiningDate: new Date('2020-07-18'),
        address: {
            street: '1111 Gardanibagh',
            city: 'Patna',
            state: 'Bihar',
            zipCode: '800013'
        },
        emergencyContact: {
            name: 'Rakesh Kumar',
            phone: '9876543269',
            relationship: 'Spouse'
        }
    }
    // ... (continue copying the rest of the teacherData array from seedTeacher.js) ...
];

// --- Helper: Create Unique User for Teacher (from seedTeacher.js) ---
async function createUserForTeacher(teacher, idx) {
    const baseUsername = teacher.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let username = `${baseUsername}${idx}`;
    let counter = 1;
    let exists = await User.findOne({ username });
    while (exists) {
        username = `${baseUsername}${idx}_${counter}`;
        counter++;
        exists = await User.findOne({ username });
    }
    let email = teacher.email;
    let emailCounter = 1;
    let emailExists = await User.findOne({ email });
    while (emailExists) {
        const emailParts = teacher.email.split('@');
        email = `${emailParts[0]}${emailCounter}@${emailParts[1]}`;
        emailCounter++;
        emailExists = await User.findOne({ email });
    }
    const password = await bcrypt.hash('password123', 10);
    const user = await User.create({
        username,
        email,
        password,
        role: 'teacher',
        name: teacher.name,
        isActive: true
    });
    return user._id;
}

// --- Parent Creation Helper (from seedData.js) ---
const createParentWithUser = async (parentData, index) => {
    const parentEmail = generateEmail(`${parentData.lastName}.parent`, index);
    const hashedPassword = await bcrypt.hash('password123', 10);
    const username = parentEmail.split('@')[0];
    const parentUser = await User.create({ username, email: parentEmail, password: hashedPassword, role: 'parent', name: parentData.name, isActive: true });
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

// --- Cleanup ---
const cleanup = async () => {
    console.log('Cleaning up...');
    if (mongoose.connection) await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// --- Main Seeder ---
const seedDatabase = async () => {
    try {
        if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined in environment variables');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // --- Clear previous data (fix typo: deleteMany) ---
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

        // --- Create Classes ---
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
                    name: `${className}`,
                    number: parseInt(className),
                    level: structure.level,
                    capacity: 90,
                    academicYear: '2024-2025'
                });
                classes.push(cls);
            }
        }
        console.log(`Created ${classes.length} classes`);

        // --- Create Subjects (from seedTeacher.js logic) ---
        const subjectsToInsert = [];
        const usedCodes = new Set();
        for (const [department, config] of Object.entries(departmentSubjectMapping)) {
            for (const subjectName of config.subjects) {
                let baseCode = subjectName.replace(/\s+/g, '').toUpperCase().substring(0, 6);
                let code = baseCode;
                let counter = 1;
                while (usedCodes.has(code)) {
                    code = baseCode.substring(0, 5) + counter;
                    counter++;
                }
                usedCodes.add(code);
                let level = config.levels;
                if (Array.isArray(level) && level.length > 0) {
                    level = level.map(lvl => lvl.toLowerCase());
                } else {
                    level = 'all';
                }
                subjectsToInsert.push({
                    name: subjectName,
                    code: code,
                    department: department,
                    level: level,
                    description: `${subjectName} - ${department} Department`,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
        const createdSubjects = await Subject.insertMany(subjectsToInsert);
        console.log(`Created ${createdSubjects.length} subjects`);
        const subjectDocs = await Subject.find({});
        const subjectMap = {};
        subjectDocs.forEach(subj => { subjectMap[subj.name] = subj._id; });

        // --- Create Sections ---
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

        // --- Helper: Get Subjects for a Class Level ---
        const getSubjectsForLevel = (level) => {
            return createdSubjects.filter(subject => 
                subject.level === 'all' || 
                (Array.isArray(subject.level) && subject.level.includes(level.toLowerCase()))
            ).map(s => s._id);
        };

        // --- Create Teachers (from teacherData, with level logic) ---
        const usedEmails = new Set();
        const teachersToInsert = [];
        for (let i = 0; i < teacherData.length; i++) {
            let teacher = { ...teacherData[i] };
            let baseEmail = teacher.email;
            let email = baseEmail;
            let counter = 1;
            while (usedEmails.has(email)) {
                const [local, domain] = baseEmail.split('@');
                email = `${local}${counter}@${domain}`;
                counter++;
            }
            usedEmails.add(email);
            teacher.email = email;
            const userId = await createUserForTeacher(teacher, i + 1);
            const basicPay = Math.floor(Math.random() * 50000 + 30000);
            const salaryDetails = {
                basicPay,
                allowances: {
                    hra: Math.floor(basicPay * 0.4),
                    da: Math.floor(basicPay * 0.1),
                    travelAllowance: 3000,
                    medicalAllowance: 2000
                },
                deductions: {
                    pf: Math.floor(basicPay * 0.12),
                    tds: Math.floor(basicPay * 0.1),
                    professionalTax: 200
                }
            };
            salaryDetails.totalAllowances = Object.values(salaryDetails.allowances).reduce((a, b) => a + b, 0);
            salaryDetails.totalDeductions = Object.values(salaryDetails.deductions).reduce((a, b) => a + b, 0);
            salaryDetails.netPay = basicPay + salaryDetails.totalAllowances - salaryDetails.totalDeductions;
            teacher.subjects = Array.isArray(teacher.specialization)
                ? [...teacher.specialization]
                : (teacher.specialization ? [teacher.specialization] : []);
            teacher.subjectIds = teacher.subjects.map(subjectName => {
                const subjectId = subjectMap[subjectName];
                if (!subjectId) {
                    console.warn(`Subject "${subjectName}" not found for teacher ${teacher.name}`);
                }
                return subjectId;
            }).filter(Boolean);
            // --- Set level randomly and remove levels field ---
            teacher.level = allowedLevels[Math.floor(Math.random() * allowedLevels.length)];
            delete teacher.levels;
            teachersToInsert.push({
                ...teacher,
                user: userId,
                staffID: teacher.staffID || `STF${i + 1}`,
                address: teacher.address
                    ? `${teacher.address.street}, ${teacher.address.city}, ${teacher.address.state}, ${teacher.address.zipCode}`
                    : '',
                employeeId: `EMP${Date.now()}${Math.floor(Math.random() * 1000)}`,
                gender: teacher.gender || (Math.random() > 0.5 ? 'Male' : 'Female'),
                dateOfBirth: teacher.dateOfBirth || new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                roles: teacher.roles || ['Teacher'],
                isActive: true,
                isClassTeacher: false,
                classTeacherFor: null,
                primaryClass: null,
                primarySection: null,
                teachingAssignments: [],
                salary: basicPay,
                salaryDetails,
                subjects: teacher.subjectIds || [],
                createdAt: new Date(),
                updatedAt: new Date(),
                level: teacher.level
            });
        }
        const insertedTeachers = await Teacher.insertMany(teachersToInsert);
        console.log(`Created ${insertedTeachers.length} teachers`);

        // --- Create Students and Parents (from seedData.js) ---
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
                        const hashedPassword = await bcrypt.hash('password123', 10);
                        const username = studentEmail.split('@')[0];
                        const studentUser = await User.create({ username, email: studentEmail, password: hashedPassword, role: 'student', name: `${firstName} ${lastName}`, isActive: true });
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
                                rollNumber: `${cls.number}${section.name}${i.toString().padStart(2, '0')}`,
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
        if (studentBatch.length > 0) {
            await Student.insertMany(studentBatch);
        }
        console.log('Database seeding completed successfully');

        // --- Merge: Update Parent-Child Relations (from updateParentChildRelations.js) ---
        console.log('Updating parent-child relations...');
        // Get all students with valid parent references
        const students = await Student.find({ parent: { $exists: true, $ne: null } });
        console.log(`Found ${students.length} students with parent references`);
        // Group students by parent ID
        const parentChildMap = students.reduce((acc, student) => {
            const parentId = student.parent.toString();
            if (!acc[parentId]) acc[parentId] = [];
            acc[parentId].push(student._id);
            return acc;
        }, {});
        // Update each parent with their children
        let updatedParents = 0;
        for (const [parentId, childrenIds] of Object.entries(parentChildMap)) {
            try {
                await Parent.findByIdAndUpdate(
                    parentId,
                    {
                        $set: {
                            children: childrenIds,
                            hasChildren: true,
                            lastUpdated: new Date()
                        }
                    },
                    { new: true }
                );
                updatedParents++;
                // Optionally: console.log(`Updated parent ${parentId} with ${childrenIds.length} children`);
            } catch (error) {
                console.error(`Error updating parent ${parentId}:`, error);
            }
        }
        // Verify the updates
        const verifyStudents = await Student.countDocuments({ parent: { $exists: true } });
        const verifyParents = await Parent.countDocuments({ children: { $exists: true, $ne: [] } });
        console.log('\nUpdate Results:');
        console.log('----------------------------------------');
        console.log(`Total students with parents: ${verifyStudents}`);
        console.log(`Total parents with children: ${verifyParents}`);
        console.log(`Parents updated: ${updatedParents}`);
        console.log('----------------------------------------');

        await cleanup();
    } catch (error) {
        console.error('Error seeding database:', error);
        await cleanup();
    }
};

seedDatabase();
