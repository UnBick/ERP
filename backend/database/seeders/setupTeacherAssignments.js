require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Teacher = require('../../src/modules/staff/models/staffModel');
const Class = require('../../src/modules/academic/models/classModel');
const Section = require('../../src/modules/academic/models/sectionModel');
const Subject = require('../../src/modules/academic/models/subjectModel');

const setupTeacherAssignments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing assignments
        await Promise.all([
            Teacher.updateMany({}, { 
                $set: { 
                    roles: ['Teacher'],
                    isClassTeacher: false,
                    classTeacherFor: null,
                    primaryClass: null,
                    primarySection: null,
                    teachingAssignments: []
                }
            })
        ]);
        console.log('Cleared existing assignments');

        // Get existing teachers and subjects
        const teachers = await Teacher.find({ isActive: true });
        const subjects = await Subject.find({});
        const classes = await Class.find({});
        const sections = await Section.find({}).populate('class');
        
        if (!teachers.length) throw new Error('No active teachers found');
        console.log(`Found ${teachers.length} active teachers`);
        console.log(`Found ${subjects.length} subjects`);
        console.log(`Found ${classes.length} classes`);
        console.log(`Found ${sections.length} sections`);

        // Create pools for different teacher roles
        const totalTeachers = teachers.length;
        const classTeacherCount = Math.floor(totalTeachers * 0.4);
        const subjectOnlyTeacherCount = Math.floor(totalTeachers * 0.3);
        const dualRoleTeacherCount = totalTeachers - classTeacherCount - subjectOnlyTeacherCount;

        // Shuffle and split teachers
        const shuffledTeachers = [...teachers].sort(() => 0.5 - Math.random());
        const classTeachers = shuffledTeachers.slice(0, classTeacherCount);
        const subjectOnlyTeachers = shuffledTeachers.slice(classTeacherCount, classTeacherCount + subjectOnlyTeacherCount);
        const dualRoleTeachers = shuffledTeachers.slice(classTeacherCount + subjectOnlyTeacherCount);

        console.log('\nRole Distribution:');
        console.log(`Class Teachers Only: ${classTeachers.length}`);
        console.log(`Subject Teachers Only: ${subjectOnlyTeachers.length}`);
        console.log(`Dual Role Teachers: ${dualRoleTeachers.length}`);

        // Assignment tracking
        const classTeacherAssignments = new Map();
        const subjectTeacherAssignments = new Map();

        // Assign class teachers
        const allClassTeachers = [...classTeachers, ...dualRoleTeachers];
        let classTeacherIndex = 0;

        for (const section of sections) {
            if (classTeacherIndex >= allClassTeachers.length) break;
            
            const teacher = allClassTeachers[classTeacherIndex++];
            await Teacher.findByIdAndUpdate(teacher._id, {
                $set: {
                    roles: ['Class Teacher', 'Teacher'],
                    isClassTeacher: true,
                    classTeacherFor: section._id,
                    primaryClass: section.class._id,
                    primarySection: section._id
                }
            });

            classTeacherAssignments.set(teacher._id.toString(), {
                classId: section.class._id,
                sectionId: section._id
            });

            console.log(`Assigned ${teacher.name} as class teacher for ${section.class.name} Section ${section.name}`);
        }

        // Assign subject teachers
        const allSubjectTeachers = [...subjectOnlyTeachers, ...dualRoleTeachers];
        
        for (const cls of classes) {
            const classSubjects = subjects.filter(subject => 
                subject.level === 'all' || 
                (Array.isArray(subject.level) && subject.level.includes(cls.level))
            );

            for (const subject of classSubjects) {
                const availableTeachers = allSubjectTeachers.filter(teacher => {
                    const assignment = classTeacherAssignments.get(teacher._id.toString());
                    const currentAssignments = subjectTeacherAssignments.get(teacher._id.toString()) || [];
                    
                    return (!assignment || !assignment.classId.equals(cls._id)) &&
                           teacher.department === subject.department &&
                           currentAssignments.length < 4;
                });

                if (!availableTeachers.length) continue;

                const teacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
                
                if (!subjectTeacherAssignments.has(teacher._id.toString())) {
                    subjectTeacherAssignments.set(teacher._id.toString(), []);
                }
                
                subjectTeacherAssignments.get(teacher._id.toString()).push({
                    classId: cls._id,
                    subjectId: subject._id
                });

                await Teacher.findByIdAndUpdate(teacher._id, {
                    $push: {
                        teachingAssignments: {
                            class: cls._id,
                            subject: subject._id
                        }
                    }
                });

                console.log(`Assigned ${teacher.name} to teach ${subject.name} in ${cls.name}`);
            }
        }

        // Verify assignments
        const verifyTeachers = await Teacher.find({})
            .populate('classTeacherFor')
            .populate('primaryClass')
            .populate({
                path: 'teachingAssignments',
                populate: [
                    { path: 'class' },
                    { path: 'subject' }
                ]
            });

        console.log('\nFinal Assignment Statistics:');
        console.log('----------------------------------------');
        console.log(`Total Teachers: ${teachers.length}`);
        console.log(`Class Teachers Only: ${verifyTeachers.filter(t => t.isClassTeacher && t.teachingAssignments.length === 0).length}`);
        console.log(`Subject Teachers Only: ${verifyTeachers.filter(t => !t.isClassTeacher && t.teachingAssignments.length > 0).length}`);
        console.log(`Dual Role Teachers: ${verifyTeachers.filter(t => t.isClassTeacher && t.teachingAssignments.length > 0).length}`);
        console.log('----------------------------------------');

        await mongoose.connection.close();
        console.log('\nSetup completed successfully');

    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection) await mongoose.connection.close();
        process.exit(1);
    }
};

setupTeacherAssignments();