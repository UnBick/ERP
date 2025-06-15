require('dotenv').config({ path: '../.env' }); // Changed path to point to correct .env location
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin user data
const adminUser = {
    username: 'admin',
    password: 'admin@123',
    role: 'admin',
    email: 'admin@school.com',
    name: 'System Administrator',
    isActive: true
};

// Connect to MongoDB with connection options
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => {
    console.error("DB Connection Error:", err);
    process.exit(1);
});

// User Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true }); // Added timestamps

const User = mongoose.model('User', UserSchema);

async function createAdminUser() {
    try {
        console.log('Checking for existing admin user...');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.username);
            return;
        }

        // Create new admin user
        console.log('Creating new admin user...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminUser.password, salt);

        const newAdmin = await new User({
            ...adminUser,
            password: hashedPassword
        }).save();

        console.log('Admin user created successfully!');
        console.log('Username:', newAdmin.username);
        console.log('Email:', newAdmin.email);
        console.log('Password:', adminUser.password); // Show unencrypted password for first login

    } catch (error) {
        console.error('Error creating admin user:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed');
        process.exit(0);
    }
}

createAdminUser();