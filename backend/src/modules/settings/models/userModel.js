const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student', 'parent'],
        required: [true, 'User role is required']
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'active'
    },
    name: String,
    department: String,
    profile: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'role',
        // This will dynamically reference different collections based on role:
        // if role is 'teacher', it refers to Teacher collection
        // if role is 'student', it refers to Student collection
        // etc.
    },
    lastLogin: Date,
    permissions: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual fields for different profile types
userSchema.virtual('teacherProfile', {
    ref: 'Teacher',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

userSchema.virtual('studentProfile', {
    ref: 'Student',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

userSchema.virtual('parentProfile', {
    ref: 'Parent',
    localField: '_id',
    foreignField: 'user',
    justOne: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
