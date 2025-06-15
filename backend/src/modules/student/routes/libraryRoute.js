const express = require('express');
const router = express.Router();
const { 
    getAllBooks,
    getIssuedBooks,
    issueBook,
    returnBook
} = require('../controllers/libraryController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateStudent } = require('../../../middleware/roleMiddleware');

// Books Management Routes
router.get(
    '/books',
    [authMiddleware],
    getAllBooks
);

// Student Book Issue Management Routes
router.get(
    '/issued',
    [authMiddleware, validateStudent],
    getIssuedBooks
);

router.post(
    '/issue',
    [authMiddleware, validateStudent],
    issueBook
);

router.post(
    '/return/:issueId',
    [authMiddleware, validateStudent],
    returnBook
);

module.exports = router;