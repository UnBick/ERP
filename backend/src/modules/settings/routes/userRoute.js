const express = require('express');
const router = express.Router();
const { User } = require('../../auth/models/userModel');
const authMiddleware = require('../../../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('[UserRoute]', req.method, req.path, req.query);
    next();
});

// GET /users - Get all users or filter by role
router.get('/', async (req, res, next) => {
    try {
        console.log('[UserRoute] Getting users with query:', req.query);
        const { role } = req.query;
        const query = role && role !== 'all' ? { role } : {};

        // Use different populate paths based on role
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        console.log(`[UserRoute] Found ${users.length} users`);

        const enhancedUsers = users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            name: user.name,
            status: user.status || 'active',
            department: user.department || 'N/A'
        }));

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: enhancedUsers
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        next(error);
    }
});

// Other user routes
router.post('/users', authMiddleware, async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.put('/users/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
