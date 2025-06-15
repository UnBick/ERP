const mongoose = require('mongoose');

// User Schema
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

// Pre-save middleware
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const bcrypt = require('bcryptjs');
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Create models only once
const models = {
    User: mongoose.models.User || mongoose.model('User', userSchema),
    // Add other models here as needed
};

module.exports = models;
