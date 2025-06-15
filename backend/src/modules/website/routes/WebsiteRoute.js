const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../middleware/validateMiddleware');
const upload = require('../../../utils/fileUpload');

// Import Controllers
const websiteController = require('../controller/websiteController');
const aboutController = require('../controller/aboutController');
const academicsController = require('../controller/academicsController');
const activitiesController = require('../controller/activitiesController');
const eventsController = require('../controller/eventsController');
const galleryController = require('../controller/galleryController');
const homepageController = require('../controller/homepageController');
const baseController = require('../controller/baseController');

// Import Validations
const websiteValidation = require('../validations/websiteValidation');

// Public Routes
router.get('/public/home', homepageController.getPublicHome);
router.get('/public/about', aboutController.getPublicAbout);
router.get('/public/events', eventsController.getPublicEvents);
router.get('/public/gallery', galleryController.getPublicGallery);

// Protected Routes - Base Authentication
router.use(authenticate);

// Admin & Webmaster Only Routes
router.use('/admin', checkRole(['admin', 'webmaster']));

// Theme & Website Settings Routes
router.get('/admin/theme/current', websiteController.getCurrentTheme);
router.get('/admin/theme/saved', websiteController.getSavedThemes);
router.put('/admin/theme/update', validate(websiteValidation.updateTheme), websiteController.updateTheme);
router.post('/admin/theme/preset', validate(websiteValidation.saveThemePreset), websiteController.saveThemePreset);

// Website Settings
router.get('/admin/settings', websiteController.getSettings);
router.put('/admin/settings', validate(websiteValidation.updateSettings), websiteController.updateSettings);
router.post('/admin/logo', upload.single('logo'), websiteController.uploadLogo);

// Homepage Management
router.get('/admin/homepage/sections', homepageController.getSectionsStatus);
router.put('/admin/homepage/hero', validate(websiteValidation.updateHero), homepageController.updateHero);
router.get('/admin/homepage/notices', homepageController.getNotices);
router.put('/admin/homepage/notices/:id?', validate(websiteValidation.updateNotice), homepageController.updateNotice);
router.put('/admin/homepage/gallery', validate(websiteValidation.updateGallery), homepageController.updateGallery);
router.put('/admin/homepage/achievements', validate(websiteValidation.updateAchievements), homepageController.updateAchievements);
router.get('/admin/homepage/preview', homepageController.getPreview);
router.post('/admin/homepage/publish', homepageController.publishChanges);

// About Section Management
router.get('/admin/about', aboutController.getAboutContent);
router.put('/admin/about', validate(websiteValidation.updateAboutContent), aboutController.updateAboutContent);
router.get('/admin/about/principal', aboutController.getPrincipalMessage);
router.put('/admin/about/principal', validate(websiteValidation.updatePrincipalMessage), aboutController.updatePrincipalMessage);
router.get('/admin/about/philosophy', aboutController.getPhilosophyMission);
router.put('/admin/about/philosophy', validate(websiteValidation.updatePhilosophyMission), aboutController.updatePhilosophyMission);

// Facilities Management
router.get('/admin/facilities', aboutController.getFacilities);
router.post('/admin/facilities', upload.array('images'), validate(websiteValidation.createFacility), aboutController.createFacility);
router.put('/admin/facilities/:id', upload.array('images'), validate(websiteValidation.updateFacility), aboutController.updateFacility);
router.delete('/admin/facilities/:id', aboutController.deleteFacility);

// Academic Section Management
router.get('/admin/academics/curriculum', academicsController.getCurriculum);
router.put('/admin/academics/curriculum', validate(websiteValidation.updateCurriculum), academicsController.updateCurriculum);
router.get('/admin/academics/syllabus', academicsController.getAllSyllabus);
router.post('/admin/academics/syllabus', upload.single('file'), validate(websiteValidation.uploadSyllabus), academicsController.uploadSyllabus);
router.delete('/admin/academics/syllabus/:id', academicsController.deleteSyllabus);

// Activities Management
router.get('/admin/activities', activitiesController.getAllActivities);
router.post('/admin/activities', upload.array('images'), validate(websiteValidation.createActivity), activitiesController.createActivity);
router.put('/admin/activities/:id', upload.array('images'), validate(websiteValidation.updateActivity), activitiesController.updateActivity);
router.delete('/admin/activities/:id', activitiesController.deleteActivity);

// Gallery Management
router.get('/admin/gallery/albums', galleryController.getAlbums);
router.post('/admin/gallery/albums', validate(websiteValidation.createAlbum), galleryController.createAlbum);
router.put('/admin/gallery/albums/:id', validate(websiteValidation.updateAlbum), galleryController.updateAlbum);
router.delete('/admin/gallery/albums/:id', galleryController.deleteAlbum);
router.post('/admin/gallery/media', upload.array('files'), validate(websiteValidation.uploadMedia), galleryController.uploadMedia);
router.delete('/admin/gallery/media/:id', galleryController.deleteMedia);

// Events Management
router.get('/admin/events', eventsController.getAllEvents);
router.post('/admin/events', upload.array('images'), validate(websiteValidation.createEvent), eventsController.createEvent);
router.put('/admin/events/:id', upload.array('images'), validate(websiteValidation.updateEvent), eventsController.updateEvent);
router.delete('/admin/events/:id', eventsController.deleteEvent);

// Calendar Events
router.get('/admin/calendar', eventsController.getCalendarEvents);
router.post('/admin/calendar', validate(websiteValidation.createCalendarEvent), eventsController.createCalendarEvent);
router.put('/admin/calendar/:id', validate(websiteValidation.updateCalendarEvent), eventsController.updateCalendarEvent);
router.delete('/admin/calendar/:id', eventsController.deleteCalendarEvent);

// File Management
router.post('/admin/upload', upload.single('file'), baseController.uploadMedia);
router.delete('/admin/files/:id', baseController.deleteFile);

// Cache Management
router.post('/admin/cache/clear', baseController.clearCache);
router.post('/admin/cache/warm', baseController.warmCache);

// Error Handler
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = router;