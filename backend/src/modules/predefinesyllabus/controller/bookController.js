const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Book = require('../models/bookModel');
const Student = require('../../student/models/studentModel');

// Get all books based on filters
exports.getBooks = catchAsync(async (req, res) => {
    const { class: classId, subject, category, search } = req.query;
    const query = {};

    if (classId) query.class = classId;
    if (subject) query.subject = subject;
    if (category) query.category = category;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    const books = await Book.find(query)
        .populate('class', 'name')
        .populate('subject', 'name')
        .sort('-createdAt');

    res.json(ApiResponse.success('Books retrieved successfully', books));
});

// Get book by ID
exports.getBookById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const book = await Book.findById(id)
        .populate('class', 'name')
        .populate('subject', 'name');

    if (!book) {
        return res.status(404).json(ApiResponse.error('Book not found'));
    }

    res.json(ApiResponse.success('Book retrieved successfully', book));
});

// Create new book
exports.createBook = catchAsync(async (req, res) => {
    const bookData = {
        ...req.body,
        addedBy: req.user._id
    };

    if (req.files) {
        if (req.files.coverImage) {
            bookData.coverImage = req.files.coverImage[0].path;
        }
        if (req.files.bookFile) {
            bookData.pdfUrl = req.files.bookFile[0].path;
        }
    }

    const book = await Book.create(bookData);
    res.status(201).json(ApiResponse.success('Book created successfully', book));
});

// Update book
exports.updateBook = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.files) {
        if (req.files.coverImage) {
            updateData.coverImage = req.files.coverImage[0].path;
        }
        if (req.files.bookFile) {
            updateData.pdfUrl = req.files.bookFile[0].path;
        }
    }

    const book = await Book.findByIdAndUpdate(id, updateData, { new: true });
    res.json(ApiResponse.success('Book updated successfully', book));
});

// Delete book
exports.deleteBook = catchAsync(async (req, res) => {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    res.json(ApiResponse.success('Book deleted successfully'));
});

// Get student's books
exports.getMyBooks = catchAsync(async (req, res) => {
    const student = await Student.findById(req.user.studentId)
        .populate('class');

    const books = await Book.find({
        class: student.class,
        isRequired: true
    }).populate('subject', 'name');

    res.json(ApiResponse.success('Student books retrieved successfully', books));
});

// Update reading progress
exports.updateReadingProgress = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { currentPage, timeSpent } = req.body;

    const book = await Book.findById(id);
    if (!book) {
        return res.status(404).json(ApiResponse.error('Book not found'));
    }

    let progress = book.readingProgress.find(p => 
        p.student.toString() === req.user.studentId
    );

    if (!progress) {
        book.readingProgress.push({
            student: req.user.studentId,
            currentPage,
            timeSpent,
            lastRead: new Date()
        });
    } else {
        progress.currentPage = currentPage;
        progress.timeSpent += timeSpent;
        progress.lastRead = new Date();
        if (currentPage === book.totalPages) {
            progress.completed = true;
        }
    }

    await book.save();
    res.json(ApiResponse.success('Reading progress updated successfully'));
});

// Add bookmark
exports.addBookmark = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { page, note } = req.body;

    const book = await Book.findById(id);
    if (!book) {
        return res.status(404).json(ApiResponse.error('Book not found'));
    }

    let progress = book.readingProgress.find(p => 
        p.student.toString() === req.user.studentId
    );

    if (!progress) {
        return res.status(400).json(ApiResponse.error('Start reading the book first'));
    }

    progress.bookmarks.push({
        page,
        note,
        timestamp: new Date()
    });

    await book.save();
    res.json(ApiResponse.success('Bookmark added successfully'));
});

// Remove bookmark
exports.removeBookmark = catchAsync(async (req, res) => {
    const { id, bookmarkId } = req.params;

    const book = await Book.findById(id);
    if (!book) {
        return res.status(404).json(ApiResponse.error('Book not found'));
    }

    let progress = book.readingProgress.find(p => 
        p.student.toString() === req.user.studentId
    );

    if (!progress) {
        return res.status(400).json(ApiResponse.error('No reading progress found'));
    }

    progress.bookmarks = progress.bookmarks.filter(b => 
        b._id.toString() !== bookmarkId
    );

    await book.save();
    res.json(ApiResponse.success('Bookmark removed successfully'));
});

// Get book categories
exports.getBookCategories = catchAsync(async (req, res) => {
    const categories = await Book.distinct('category');
    res.json(ApiResponse.success('Categories retrieved successfully', categories));
});

// Search books
exports.searchBooks = catchAsync(async (req, res) => {
    const { query } = req.query;
    const books = await Book.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { author: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }).populate('class subject');

    res.json(ApiResponse.success('Search results retrieved successfully', books));
});