const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');

// Basic book routes with proper paths
router.get('/books', libraryController.getBooks);
router.get('/recommendations', libraryController.getRecommendations);
router.get('/issued-books', libraryController.getIssuedBooks);

// Book actions with proper paths
router.post('/issue-book', libraryController.issueBook);
router.post('/return-book', libraryController.returnBook);  // Changed from PUT to POST
router.post('/pay-fine', libraryController.payFine);

module.exports = router;
