require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Teacher = require('../../src/modules/staff/models/staffModel');
const Class = require('../../src/modules/academic/models/classModel');
const Section = require('../../src/modules/academic/models/sectionModel');

// ... keep existing requires and initial setup ...

const updateExistingTeachers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get all active teachers
        const teachers = await Teacher.find({ isActive: true });
        console.log(`Found ${teachers.length} active teachers`);

        // Get all sections with their class information
        const sections = await Section.find({}).populate('class');
        console.log(`Found ${sections.length} sections`);

        // Reset all teachers
        await Teacher.updateMany(
            {},
            {
                $set: {
                    roles: ['Teacher'],
                    isClassTeacher: false,
                    classTeacherFor: null
                }
            }
        );
        console.log('Reset all teachers to default roles');

        // Shuffle teachers
        const shuffledTeachers = [...teachers].sort(() => 0.5 - Math.random());
        let teacherIndex = 0;
        const assignedTeachers = new Set();

        // Assign class teachers
        for (const section of sections) {
            if (teacherIndex >= shuffledTeachers.length) break;

            const teacher = shuffledTeachers[teacherIndex];

            try {
                // Update teacher document
                const updatedTeacher = await Teacher.findByIdAndUpdate(
                    teacher._id,
                    {
                        $set: {
                            classTeacherFor: section._id,
                            isClassTeacher: true,
                            roles: ['Class Teacher', 'Teacher'],
                            section: section._id,
                            class: section.class._id // Add class reference
                        }
                    },
                    { new: true } // Return updated document
                );

                // Update section document
                await Section.findByIdAndUpdate(
                    section._id,
                    {
                        $set: {
                            classTeacher: teacher._id
                        }
                    }
                );

                console.log(`Assigned Class Teacher: ${updatedTeacher.name} to Section ${section.name}`);
                assignedTeachers.add(teacher._id.toString());
                teacherIndex++;
            } catch (err) {
                console.error(`Error assigning teacher ${teacher.name} to section ${section.name}:`, err);
            }
        }

        // Update remaining teachers
        const remainingTeachers = shuffledTeachers.filter(t => 
            !assignedTeachers.has(t._id.toString())
        );

        if (remainingTeachers.length > 0) {
            await Promise.all(remainingTeachers.map(teacher =>
                Teacher.findByIdAndUpdate(
                    teacher._id,
                    {
                        $set: {
                            roles: ['Teacher'],
                            isClassTeacher: false,
                            classTeacherFor: null
                        }
                    }
                )
            ));
            console.log(`Updated ${remainingTeachers.length} subject teachers`);
        }

        // Verify assignments with proper population
        console.log('\nVerifying assignments:');
        const verifyTeachers = await Teacher.find({ isClassTeacher: true })
            .populate('section')
            .populate('class');

        for (const teacher of verifyTeachers) {
            console.log(`Teacher ${teacher.name}: Class Teacher for ${teacher.class?.name || 'N/A'} - Section ${teacher.section?.name || 'N/A'}`);
        }

        const verifyRemainingTeachers = await Teacher.find({ isClassTeacher: false });
        console.log(`\nSubject Teachers: ${verifyRemainingTeachers.length}`);

        console.log('\nTeacher permissions updated successfully');
        console.log('----------------------------------------');
        console.log(`Total sections: ${sections.length}`);
        console.log(`Class teachers assigned: ${assignedTeachers.size}`);
        console.log(`Subject teachers: ${remainingTeachers.length}`);
        console.log('----------------------------------------');

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection) await mongoose.connection.close();
        process.exit(1);
    }
};

updateExistingTeachers();