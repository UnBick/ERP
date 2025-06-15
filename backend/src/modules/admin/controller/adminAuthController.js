const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    // ...existing auth logic from auth.js...
  } catch (error) {
    res.status(500).json({ message: 'Authentication failed' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    res.json(admin);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
