const express = require('express');
const router = express.Router();
const User = require('../../auth/models/userModel'); // Fix the import path
const authMiddleware = require('../../../middleware/authMiddleware');
const { handleUploadError } = require('../../../utils/fileUpload');
const multer = require('multer');


// ===== USER STATISTICS ROUTES (must come before /users/:id) =====
router.get('/stats/overview', async (req, res, next) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusStats = await User.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalUsers = await User.countDocuments();

        res.json({
            success: true,
            message: 'User statistics retrieved successfully',
            data: {
                totalUsers,
                byRole: stats,
                byStatus: statusStats
            }
        });
    } catch (error) {
        console.error('[UserRoute] Stats error:', error);
        next(error);
    }
});

// ===== USER MANAGEMENT ROUTES =====
// GET /users - Get all users or filter by role
router.get('/', async (req, res, next) => {
    try {
        console.log('[UserRoute] Getting users with query:', req.query);
        const { role, status, search } = req.query;
        
        // Build query object
        const query = {};
        if (role && role !== 'all') query.role = role;
        if (status && status !== 'all') query.status = status;
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        console.log(`[UserRoute] Found ${users.length} users`);

        const enhancedUsers = users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            name: user.name || user.username,
            status: user.status || 'active',
            department: user.department || user.teacherProfile?.department || 'N/A',
            staffID: user.teacherProfile?.staffID,
            enrollmentNumber: user.studentProfile?.enrollmentNumber,
            designation: user.teacherProfile?.designation,
            createdAt: user.createdAt
        }));

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: enhancedUsers,
            total: enhancedUsers.length
        });
    } catch (error) {
        console.error('[UserRoute] Error fetching users:', error);
        next(error);
    }
});

// GET /users/:id - Get single user by ID
router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')

        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User retrieved successfully',
            data: user
        });
    } catch (error) {
        console.error('[UserRoute] Error fetching user:', error);
        next(error);
    }
});

// POST /users - Create new user
router.post('/', async (req, res, next) => {
    try {
        const { username, email, role, password, name, department } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this username or email already exists'
            });
        }
        
        const user = await User.create({
            username,
            email,
            role,
            password,
            name,
            department,
            createdBy: req.user?._id
        });

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });
    } catch (error) {
        console.error('[UserRoute] Create user error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        next(error);
    }
});

// PUT /users/:id - Update user
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };
        
        // Remove password if it's empty or undefined
        if (!updateData.password || updateData.password.trim() === '') {
            delete updateData.password;
        }

        // Prevent updating certain fields
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const user = await User.findByIdAndUpdate(
            id, 
            { ...updateData, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error('[UserRoute] Update user error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }
        next(error);
    }
});

// DELETE /users/:id - Delete user
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully',
            data: { id: user._id, username: user.username }
        });
    } catch (error) {
        console.error('[UserRoute] Delete user error:', error);
        next(error);
    }
});

// PUT /users/:id/status - Update user status
router.put('/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User status updated successfully',
            data: user
        });
    } catch (error) {
        console.error('[UserRoute] Update status error:', error);
        next(error);
    }
});

// PUT /users/:id/permissions - Update user permissions
router.put('/:id/permissions', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;
        
        const user = await User.findByIdAndUpdate(
            id,
            { permissions, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User permissions updated successfully',
            data: user
        });
    } catch (error) {
        console.error('[UserRoute] Update permissions error:', error);
        next(error);
    }
});



module.exports = router;