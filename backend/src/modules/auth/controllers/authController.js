const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BlacklistedToken = require('../models/blacklistedToken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../../../services/sendEmail');
const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');

// JWT Token Generation
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      role: user.role,
      username: user.username 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const authController = {
  // User Registration
  register: async (req, res) => {
    try {
      const { name, email, password, role, username } = req.body;

      // Check existing user
      const userExists = await User.findOne({ 
        $or: [{ email }, { username }] 
      });

      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists'
        });
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        username,
        password,
        role
      });

      const token = generateToken(user);

      res.status(201).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  },

  // User Login
  login: async (req, res) => {
    try {
      console.log('Login Request Body:', req.body);
      console.log('Loaded JWT_SECRET:', process.env.JWT_SECRET);

       // 🔐 Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error('🚨 JWT_SECRET is missing in environment variables!');
      return res.status(500).json({
        success: false,
        message: 'Server misconfiguration: JWT_SECRET not set.'
      });
    }
      const { identifier, password } = req.body;
      

      // Find user by username or email
      const user = await User.findOne({
        $or: [
          { username: identifier },
          { email: identifier }
        ]
      }).select('+password');

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  },

  // Send OTP
  sendOtp: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const otp = crypto.randomBytes(3).toString('hex');
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      await sendEmail(email, 'Your OTP', `Your OTP is ${otp}`);
      
      res.json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (error) {
      console.error('OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP'
      });
    }
  },

  // Verify OTP
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Clear OTP
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      const token = generateToken(user);

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({
        success: false,
        message: 'OTP verification failed'
      });
    }
  },

  // Forgot Password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendEmail(email, 'Password Reset', `Reset your password using this link: ${resetUrl}`);

      res.json({
        success: true,
        message: 'Password reset link sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send reset link'
      });
    }
  },

  // Reset Password
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      user.password = password;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset failed'
      });
    }
  },

  // Logout
  logout: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        await BlacklistedToken.create({
          token,
          createdAt: new Date()
        });
      }

      // Clear session if exists
      if (req.session) {
        await new Promise((resolve, reject) => {
          req.session.destroy((err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }

      res.clearCookie('token');
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  },

  // Get User Profile
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile'
      });
    }
  },

  // Update User Profile
  updateProfile: async (req, res) => {
    try {
      const updates = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
};

module.exports = authController;
