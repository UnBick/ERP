require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Teacher = require('../src/modules/staff/models/staffModel');
const Subject = require('../src/modules/academic/models/subjectModel');

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch teachers with populated subjects
    const teachers = await Teacher.find({ isActive: true })
      .populate('subjects', 'name')  // 👈 populate subject names
      .exec();

    console.log('📋 Teacher – Department – Subjects Mapping:\n');

    for (const teacher of teachers) {
      const name = teacher.name || teacher.staffID || teacher._id;
      const department = teacher.department || 'N/A';
      const subjects = Array.isArray(teacher.subjects)
        ? teacher.subjects.map(s => s.name).filter(Boolean)
        : [];

      console.log(`👨‍🏫 Teacher: ${name}`);
      console.log(`   🏢 Department: ${department}`);
      console.log(`   📚 Subjects: ${subjects.length > 0 ? subjects.join(', ') : 'N/A'}`);
      console.log('----------------------------------------');
    }

    await mongoose.connection.close();
    console.log('\n✅ Done. Database connection closed.');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

main();
