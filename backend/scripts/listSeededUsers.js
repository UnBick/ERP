/**
 * Script to list all users created by seedTeacher.js
 * Shows username, email, and password hash.
 * Usage: node listSeededUsers.js
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const userSchema = require('../src/modules/auth/models/user.js').schema;
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function listUsers() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URI;
    if (!mongoUri) {
        console.error('Error: MONGODB_URI environment variable is not set.');
        process.exit(1);
    }
    await mongoose.connect(mongoUri);
    const users = await User.find({}).select('username email password');
    console.log('Seeded Users:');
    users.forEach(user => {
        console.log(`Username: ${user.username}\nEmail: ${user.email}\nPassword Hash: ${user.password}\n---`);
    });
    await mongoose.connection.close();
}

listUsers().catch(err => {
    console.error('Error listing users:', err);
    process.exit(1);
});
