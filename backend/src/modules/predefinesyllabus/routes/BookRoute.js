const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const bookValidation = require('../validations/predefinesyllabusValidation');
const bookController = require('../controller/bookController');
const upload = require('../../../utils/fileUpload');

router.use(authenticate);

// Public routes
router.get('/', bookController.getBooks);
router.get('/categories', bookController.getCategories);
router.get('/recommendations', bookController.getBookRecommendations);

// Student/Parent routes
router.get('/reading-history', bookController.getReadingHistory);
router.get('/reading-analytics', bookController.getReadingAnalytics);
router.post('/:id/progress', validate(bookValidation.updateProgress), bookController.updateReadingProgress);
router.post('/:id/bookmark', validate(bookValidation.addBookmark), bookController.addBookmark);
router.post('/:id/annotation', validate(bookValidation.addAnnotation), bookController.addAnnotation);

// Teacher routes
router.post('/assign', checkRole(['teacher']), validate(bookValidation.assignBook), bookController.assignBook);
router.get('/assigned', checkRole(['teacher']), bookController.getAssignedBooks);

// Admin routes
router.post(
    '/',
    checkRole(['admin']),
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'bookFile', maxCount: 1 }
    ]),
    validate(bookValidation.create),
    bookController.createBook
);

router.put(
    '/:id',
    checkRole(['admin']),
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'bookFile', maxCount: 1 }
    ]),
    validate(bookValidation.update),
    bookController.updateBook
);

router.delete('/:id', checkRole(['admin']), bookController.deleteBook);

// Collection routes
router.post('/collections', validate(bookValidation.createCollection), bookController.createCollection);
router.get('/collections', bookController.getCollections);

module.exports = router;