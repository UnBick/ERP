require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Parent = require('../../src/modules/parent/models/parentModel');
const Student = require('../../src/modules/student/models/studentModel');

const updateParentChildRelations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // First, get all students with valid parent references
        const students = await Student.find({ parent: { $exists: true, $ne: null } });
        console.log(`Found ${students.length} students with parent references`);

        // Group students by parent ID
        const parentChildMap = students.reduce((acc, student) => {
            const parentId = student.parent.toString();
            if (!acc[parentId]) {
                acc[parentId] = [];
            }
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
                console.log(`Updated parent ${parentId} with ${childrenIds.length} children`);
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

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Handle interruptions
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, async () => {
        console.log(`\nReceived ${signal}, closing connection...`);
        await mongoose.connection.close();
        process.exit(0);
    });
});

// Run the update
updateParentChildRelations();
