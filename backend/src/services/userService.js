// src/services/userService.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Object} - Created user
 */
const createUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return await user.save();
};

/**
 * Find a user by ID
 * @param {String} userId - User ID
 * @returns {Object} - User object
 */
const findUserById = async (userId) => {
  return await User.findById(userId).select('-password');
};

/**
 * Update user details
 * @param {String} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} - Updated user
 */
const updateUser = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
};

module.exports = {
  createUser,
  findUserById,
  updateUser,
};