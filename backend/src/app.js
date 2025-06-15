const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./config/dbConfig');
const { errorHandler } = require('./middleware/errorMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const { checkRole } = require('./middleware/roleMiddleware');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const http = require('http');
const loggingMiddleware = require('./middleware/loggingMiddleware');

// Import routes
const authRoutes = require('./modules/auth/routes/authRoute');
const adminRoutes = require('./modules/admin/routes/AdminRouter');
const settingsRoutes = require('./modules/settings/routes/settingsRoute'); // Updated import
const staffRoutes = require('./modules/staff/routes/staffRoutes');
const libraryRoutes = require('./modules/library/routes/libraryRoutes');
const examRoutes = require('./modules/exams/routes/examRoute'); // Updated import
const feesRoutes = require('./modules/fees/routes/feesRoutes');
const payrollRoutes = require('./modules/finance/routes/payrollRoutes');
const reportRoutes = require('./modules/reports/routes/reportRoutes');
const classRoutes = require('./modules/academic/routes/classRoutes');
const sectionRoutes = require('./modules/academic/routes/sectionRoutes');
const teacherRoutes = require('./modules/teacher/routes/teacherRoutes'); // Keep only this one
const parentRoutes = require('./modules/parent/routes/parentDashboardRoute'); // Update parent route import
const messageRoutes = require('./modules/admin/routes/messageRoutes');
const communicationRoutes = require('./modules/communication/routes/messageRoutes');
const user = require('./modules/settings/routes/userRoute');
// Import the combined student routes
const studentRoutes = require('./modules/student/routes');
// Import parent routes correctly
const parentDashboardRoute = require('./modules/parent/routes/parentDashboardRoute');
const teacherAttendanceRoutes = require('./modules/teacher/routes/attendanceRoute');
const gradingRoutes = require('./modules/teacher/routes/gradingRoute');
// Add this with other route imports
const feesDetailsRoute = require('./modules/parent/routes/feesDetailsRoute');

// Import parent routes
const ParentRoutes = require('./modules/parent/routes/parentRoutes');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.set('trust proxy', 1);

// Ensure uploads directory exists with proper permissions
const uploadsDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
}

// Static files setup - move this before routes
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Add CORS headers specifically for images
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// CORS configuration - update this section
const corsOptions = {
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.'
        });
    }
});
app.use('/api/', apiLimiter);

// Create required directories
[
    '../uploads',
    '../assets',
    '../public/images',
    '../public/documents',
    '../uploads/students',
    '../uploads/staff',
    '../uploads/documents'
].forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Debug middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Debug middleware - add this before routes
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.path}`);
    next();
});

// Add logging middleware before routes
app.use(loggingMiddleware);

// Debug middleware for all routes
app.use((req, res, next) => {
    console.log('Incoming request:', {
        url: req.url,
        method: req.method,
        path: req.path
    });
    next();
});

// Route registration - update order and paths
app.use('/api/v1/auth', authRoutes);

// Update parent route registration
app.use('/api/v1/parent', require('./modules/parent/routes/parentRoutes'));

// Mount parent routes
app.use('/api/v1/parent', parentRoutes);

// User routes should be protected
app.use('/api/v1/users', authMiddleware, require('./modules/settings/routes/userRoute'));

// Remove duplicate settings routes
app.use('/api/v1/settings', authMiddleware, settingsRoutes);

app.use('/api/v1/admin', authMiddleware, checkRole(['admin']), adminRoutes);
app.use('/api/v1/admin/staff', authMiddleware, staffRoutes);
app.use('/api/v1/admin/exams', authMiddleware, examRoutes);
app.use('/api/exams', examRoutes); // Updated route registration
app.use('/api/v1/admin/fees', authMiddleware, feesRoutes);
app.use('/api/v1/admin/reports', authMiddleware, reportRoutes);
app.use('/api/v1/admin/classes', authMiddleware, classRoutes);
app.use('/api/v1/admin/sections', authMiddleware, sectionRoutes);
app.use('/api/v1/parents', authMiddleware, parentRoutes);
app.use('/api/v1/admin', authMiddleware, messageRoutes);
app.use('/api/v1/communication', communicationRoutes);
app.use('/api/v1/teacher', authMiddleware, teacherRoutes); // Add this line
app.use('/api/v1/teacher/attendance', authMiddleware, teacherAttendanceRoutes);

// Update the grading routes registration
app.use('/api/v1/teacher/grading', 
    authMiddleware, 
    checkRole(['teacher']), 
    gradingRoutes
);

// Update the route registration for student routes
app.use('/api/v1/student', authMiddleware, checkRole(['student']), studentRoutes);

// Remove or comment out these lines
// app.use('/api/v1/students', authMiddleware, studentRoutes);
// app.use('/api/v1/student', authMiddleware, studentDashboardRoute);

// Special route for payroll with debug logging
app.use('/api/v1/admin/finance/payroll', (req, res, next) => {
    console.log('[PayrollAPI]', {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query
    });
    next();
}, authMiddleware, payrollRoutes);

// Update the communication routes registration - move this before error handling
app.use('/api/v1/teacher/communication', 
    authMiddleware, 
    checkRole(['teacher']), 
    (req, res, next) => {
        console.log('Communication request:', {
            path: req.path,
            method: req.method,
            query: req.query,
            body: req.body
        });
        next();
    },
    communicationRoutes
);

// Add this with other route registrations
app.use('/api/v1/parent/fees', feesDetailsRoute);

// Add parent communication routes
app.use('/api/v1/parent/communication', require('./modules/parent/routes/communicationRoutes'));

// Error handling
app.use(errorHandler);

// Add error handling middleware at the end
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Socket.io setup
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['x-auth-token']
    }
});

io.on('connection', (socket) => {
    require('./services/socketHandlers')(socket, io);
    socket.on('disconnect', () => console.log('Client disconnected'));
});

// Graceful shutdown
['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        try {
            server.close(() => console.log('HTTP server closed'));
            io.close(() => console.log('Socket.IO closed'));
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });
});

// Start server
const startServer = async () => {
    try {
        // Ensure database connection is established first
        await connectDB();
        
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`
            Server Info:
            - Environment: ${process.env.NODE_ENV || 'development'}
            - Port: ${PORT}
            - Database: ${mongoose.connection.host}
            - Started: ${new Date().toISOString()}
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = { app, server, io };