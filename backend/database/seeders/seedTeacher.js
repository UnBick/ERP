require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Teacher = require('../../src/modules/staff/models/staffModel'); // Use this model everywhere for teachers
const Subject = require('../../src/modules/academic/models/subjectModel');
const userSchema = require('../../src/modules/auth/models/user.js').schema;
const User = mongoose.models.User || mongoose.model('User', userSchema); // Ensure correct path
const bcrypt = require('bcryptjs'); // For password hashing

// Department-Subject mapping with education levels
const departmentSubjectMapping = {
    'Mathematics': {
        subjects: ['Mathematics'],
        levels: ['primary', 'middle', 'secondary', 'higher secondary']
    },
    'Science': {
        subjects: ['General Science', 'Physics', 'Chemistry', 'Biology'],
        levels: {
            'General Science': ['primary', 'middle'],
            'Physics': ['secondary', 'higher secondary'],
            'Chemistry': ['secondary', 'higher secondary'],
            'Biology': ['secondary', 'higher secondary']
        }
    },
    'Arts': {
        subjects: ['History', 'Civics', 'Geography', 'Political Science', 'Economics'],
        levels: {
            'History': ['primary', 'middle', 'secondary', 'higher secondary'],
            'Civics': ['middle', 'secondary', 'higher secondary'],
            'Geography': ['primary', 'middle', 'secondary', 'higher secondary'],
            'Political Science': ['secondary', 'higher secondary'],
            'Economics': ['secondary', 'higher secondary']
        }
    },
    'Languages': {
        subjects: ['English', 'Hindi', 'Sanskrit'],
        levels: ['primary', 'middle', 'secondary', 'higher secondary']
    },
    'Physical Education': {
        subjects: ['Physical Education'],
        levels: ['primary', 'middle', 'secondary', 'higher secondary']
    },
    'Fine Arts': {
        subjects: ['Drawing', 'Music', 'Dance'],
        levels: ['primary', 'middle', 'secondary', 'higher secondary']
    },
    'Computer Science': {
        subjects: ['Computer Science'],
        levels: ['middle', 'secondary', 'higher secondary']
    },
    'Commerce': {
        subjects: ['Accountancy', 'Business Studies'],
        levels: ['secondary', 'higher secondary']
    },
    'Home Science': {
        subjects: ['Home Science'],
        levels: ['middle', 'secondary', 'higher secondary']
    }
};

// Enhanced teacher data with specific subject specializations
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
];

// Helper to create a unique user for each teacher
async function createUserForTeacher(teacher, idx, User) {
    const baseUsername = teacher.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let username = `${baseUsername}${idx}`;
    let counter = 1;

    // Ensure username is unique
    let exists = await User.findOne({ username });
    while (exists) {
        username = `${baseUsername}${idx}_${counter}`;
        counter++;
        exists = await User.findOne({ username });
    }

    // Ensure email is unique
    let email = teacher.email;
    let emailCounter = 1;
    let emailExists = await User.findOne({ email });
    while (emailExists) {
        // Insert a number before the @ to make it unique
        const emailParts = teacher.email.split('@');
        email = `${emailParts[0]}${emailCounter}@${emailParts[1]}`;
        emailCounter++;
        emailExists = await User.findOne({ email });
    }

    const password = await require('bcryptjs').hash('password123', 10);
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

const seedTeachers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Only clear Subject and Teacher collections to avoid affecting other data
        await Subject.deleteMany({});
        await Teacher.deleteMany({});
        console.log('🗑️  Cleared existing subjects and teachers');

        // First, update/create subjects with department mapping and levels
        console.log('\n📚 Updating subjects with department mapping...');
        
        const subjectsToInsert = [];
        // Before pushing to subjectsToInsert, ensure subject code is unique
        const usedCodes = new Set();

        for (const [department, config] of Object.entries(departmentSubjectMapping)) {
            for (const subjectName of config.subjects) {
                // Generate a unique code (first 6 uppercase letters, fallback to add a number if duplicate)
                let baseCode = subjectName.replace(/\s+/g, '').toUpperCase().substring(0, 6);
                let code = baseCode;
                let counter = 1;
                while (usedCodes.has(code)) {
                    code = baseCode.substring(0, 5) + counter;
                    counter++;
                }
                usedCodes.add(code);

                // Ensure level is either 'all' or a non-empty array of strings (lowercase)
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

        const insertedSubjects = await Subject.insertMany(subjectsToInsert);
        console.log(`✅ Created ${insertedSubjects.length} subjects with department mapping`);

        // Build a subject name -> ObjectId map after creating subjects
        const subjectDocs = await Subject.find({});
        const subjectMap = {};
        subjectDocs.forEach(subj => {
            subjectMap[subj.name] = subj._id;
        });

        // Prepare teacher data with subject assignments
        // Before inserting teachers, ensure all emails are unique
        const usedEmails = new Set();
        const teachersToInsert = [];

        // When creating teacher data, define basicPay before using it
        for (let i = 0; i < teacherData.length; i++) {
            let teacher = { ...teacherData[i] };
            let baseEmail = teacher.email;
            let email = baseEmail;
            let counter = 1;
            // Ensure email is unique in this batch
            while (usedEmails.has(email)) {
                const [local, domain] = baseEmail.split('@');
                email = `${local}${counter}@${domain}`;
                counter++;
            }
            usedEmails.add(email);
            teacher.email = email;
            // Create a user for each teacher
            // eslint-disable-next-line no-await-in-loop
            const userId = await createUserForTeacher(teacher, i + 1, User);

            // Define basicPay before using it
            const basicPay = Math.floor(Math.random() * 50000 + 30000);

            // Now use basicPay for salaryDetails and salary
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

            // Ensure subjects matches specialization
            teacher.subjects = Array.isArray(teacher.specialization)
                ? [...teacher.specialization]
                : (teacher.specialization ? [teacher.specialization] : []);

            // Assign only specialized subjects to teacher
            teacher.subjects = Array.isArray(teacher.specialization)
                ? [...teacher.specialization]
                : (teacher.specialization ? [teacher.specialization] : []);

            // Map subject names to ObjectIds for the teacher's specialization only
            teacher.subjectIds = teacher.subjects.map(subjectName => {
                const subjectId = subjectMap[subjectName];
                if (!subjectId) {
                    console.warn(`⚠️  Subject "${subjectName}" not found for teacher ${teacher.name}`);
                }
                return subjectId;
            }).filter(Boolean); // Remove undefined values

            teachersToInsert.push({
                ...teacher,
                user: userId, // Assign user ObjectId
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
                // Use only the specialization subject ObjectIds
                subjects: teacher.subjectIds || [],
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Insert teachers
        const insertedTeachers = await Teacher.insertMany(teachersToInsert);
        console.log(`✅ Created ${insertedTeachers.length} teachers`);

        // Display summary
        console.log('\n📊 SEEDING SUMMARY');
        console.log('==========================================');
        console.log(`📚 Subjects created: ${insertedSubjects.length}`);
        console.log(`👨‍🏫 Teachers created: ${insertedTeachers.length}`);
        console.log('🏫 Departments covered:');
        Object.keys(departmentSubjectMapping).forEach(dept => {
            const teacherCount = insertedTeachers.filter(t => t.department === dept).length;
            const subjects = departmentSubjectMapping[dept].subjects;
            console.log(`   • ${dept}: ${teacherCount} teachers`);
            console.log(`     Subjects: ${subjects.join(', ')}`);
        });

        // Display Science department specializations
        console.log('\n🔬 Science Department Teacher Specializations:');
        const scienceTeachers = insertedTeachers.filter(t => t.department === 'Science');
        scienceTeachers.forEach(teacher => {
            // Defensive: handle undefined/null/empty subjects
            let subjects = [];
            if (Array.isArray(teacher.subjects)) {
                subjects = teacher.subjects;
            } else if (typeof teacher.subjects === 'string') {
                subjects = [teacher.subjects];
            }
            // If still empty, fallback to 'N/A'
            const subjectsStr = subjects.length > 0 ? subjects.join(', ') : 'N/A';
            console.log(`   • ${teacher.name}: ${subjectsStr}`);
        });

        // Display subject-teacher mapping
        console.log('\n📋 Subject-Teacher Mapping:');
        teachersToInsert.forEach(teacher => {
            // Defensive: ensure teacher.department and subjectsToInsert are defined
            if (!teacher.department) {
                console.log(`   • ${teacher.name}: Department not set`);
                return;
            }
            // Find subjects for this teacher's department
            const deptSubjects = subjectsToInsert.filter(
                s => s.department && s.department === teacher.department
            );
            // Defensive: ensure deptSubjects is an array
            const subjectNames = Array.isArray(deptSubjects)
                ? deptSubjects.map(s => s.name)
                : [];
            console.log(`   • ${teacher.name}: ${subjectNames.length > 0 ? subjectNames.join(', ') : 'N/A'}`);
        });

        console.log('\n✅ Teacher data seeding completed successfully!');
        console.log('🔗 All departments are now linked with appropriate subjects');
        console.log('🎯 Teachers are specialized in specific subjects');
        console.log('📚 Ready for teacher assignments and class allocations');

        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding teacher data:', error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Execute the seeder
seedTeachers();