// backend/src/routes/unbickSchoolingRoute.js
const express = require('express');
const { getBooks, addBook, getPredefinedSyllabi } = require('../controllers/unbickschoolingController');
const router = express.Router();

// Routes
router.get('/books', getBooks);
router.post('/books', addBook);
router.get('/syllabi', getPredefinedSyllabi);

module.exports = router;
