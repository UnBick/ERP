const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const classesController = require('../../academic/controller/classesController');
const sectionController = require('../../academic/controller/sectionController');
const subjectController = require('../../academic/controller/subjectController');
const admissionController = require('../../student/controllers/admissionController');
const studentController = require('../../student/controllers/studentController');
const attendanceController = require('../../student/controllers/attendanceController');
const examinationController = require('../../student/controllers/examinationController');
const libraryController = require('../../student/controllers/libraryController');
const serviceController = require('../../student/controllers/serviceController');
const transportController = require('../../student/controllers/transportController');
const staffController = require('../../staff/controller/staffController');

// Wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Admin router working' });
});

// Dashboard route with async handler
router.get('/dashboard', asyncHandler(dashboardController.getDashboardData));

// Base route
router.get('/', (req, res) => {
    res.json({ message: 'Admin base route' });
});

// Academic routes - Classes
router.get('/academic/classes', classesController.getAllClasses);
router.post('/academic/classes', classesController.createClass);
router.put('/academic/classes/:id', classesController.updateClass);
router.delete('/academic/classes/:id', classesController.deleteClass);
router.get('/academic/classes/export', classesController.exportData);

// Academic routes - Sections
router.get('/academic/sections', sectionController.getAllSections);
router.post('/academic/sections', sectionController.createSection);
router.put('/academic/sections/:id', sectionController.updateSection);
router.delete('/academic/sections/:id', sectionController.deleteSection);
router.get('/academic/sections/class/:classId', sectionController.getSectionsByClass);

// Academic routes - Subjects
router.get('/academic/subjects', subjectController.getAllSubjects);
router.post('/academic/subjects', subjectController.createSubject);
router.put('/academic/subjects/:id', subjectController.updateSubject);
router.delete('/academic/subjects/:id', subjectController.deleteSubject);

// Admission Management Routes
router.get('/admissions/requests', admissionController.getAdmissionRequests);
router.get('/admissions/requests/:id', admissionController.getAdmissionDetails);
router.patch('/admissions/requests/:id', admissionController.updateAdmissionStatus);
router.patch('/admissions/bulk-update', admissionController.bulkUpdateAdmissions);
router.get('/admissions/stats', admissionController.getAdmissionStats);

// Student Management Routes - Order matters!
router.get('/students/promotion-eligible', studentController.getPromotionEligibleStudents);
router.get('/students/search', studentController.searchStudents); // This must come before /students/:id
router.get('/students/dashboard-stats', studentController.getDashboardStats);
router.get('/students/export', studentController.exportStudents);
router.get('/students/:id', studentController.getStudentById);
router.get('/students', studentController.getAllStudents);
router.post('/students', studentController.createStudent);
router.put('/students/:id', studentController.updateStudent);
router.put('/students/bulk-update', studentController.bulkUpdateStudents);
router.delete('/students/:id', studentController.deleteStudent);

// Attendance Management Routes
router.get('/attendance/students', attendanceController.getStudentsByClass);
router.post('/attendance/submit', attendanceController.submitAttendance);
router.get('/attendance/statistics', attendanceController.getAttendanceStatistics);
router.get('/attendance/report', attendanceController.getMonthlyReport);

// Examination Management Routes
router.get('/examinations', examinationController.getExaminations);
router.post('/examinations/schedule', examinationController.scheduleExam);
router.post('/examinations/results/upload', examinationController.uploadResults);
router.get('/examinations/:examId/export', examinationController.exportResults);
router.get('/examinations/grade-cards', examinationController.generateGradeCards);

// Library Management Routes
router.get('/library/books', libraryController.getAllBooks);
router.get('/library/issued-books', libraryController.getIssuedBooks);
router.post('/library/issue-book', libraryController.issueBook);
router.put('/library/return-book/:issueId', libraryController.returnBook);

// Document Management Routes
router.post('/documents/generate', serviceController.generateDocument);
router.get('/documents/download/:id', serviceController.downloadDocument);
router.get('/documents/list/:studentId', serviceController.getStudentDocuments);

// Transport Management Routes
router.get('/transport/buses', transportController.getBuses);
router.get('/transport/stops', transportController.getStops);
router.post('/transport/location/:busId', transportController.updateBusLocation);
router.get('/transport/history', transportController.getRouteHistory);
router.put('/transport/alerts', transportController.updateAlertSettings);
router.post('/transport/departure/:busId/:stopId', transportController.handleBusDeparture);
router.post('/transport/arrival/:busId/:stopId', transportController.handleBusArrival);

// Staff Management Routes
router.get('/staff/dashboard-stats', staffController.getDashboardStats);
router.get('/staff', staffController.getAllStaff);
router.get('/staff/:id', staffController.getStaffById);
router.post('/staff', staffController.createStaff);
router.put('/staff/:id', staffController.updateStaff);
router.delete('/staff/:id', staffController.deleteStaff);
router.get('/staff/attendance/report', staffController.getAttendanceReport);

// Error handling middleware specific to admin routes
router.use((err, req, res, next) => {
    console.error('Admin Route Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error in admin route',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router;