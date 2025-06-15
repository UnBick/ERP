const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Book = require('../models/bookModel');
const BookIssue = require('../models/bookIssueModel');
const Student = require('../models/studentModel');
const { sendNotification } = require('../../../utils/notificationUtils');

exports.getAllBooks = async (req, res) => {
  try {
    const { search, available, category, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
        { isbn: new RegExp(search, 'i') }
      ];
    }
    
    if (available === 'true') {
      query.available = true;
    } else if (available === 'false') {
      query.available = false;
    }
    
    if (category) {
      query.category = category;
    }

    const [books, total] = await Promise.all([
      Book.find(query)
        .select('-__v')
        .sort({ title: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Book.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        books,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllBooks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
};

exports.getIssuedBooks = catchAsync(async (req, res) => {
    const studentId = req.user._id;

    const issuedBooks = await BookIssue.find({ 
        student: studentId,
        returnDate: null 
    })
    .populate('book', 'title author coverImage')
    .sort('-issueDate');

    const enhancedIssuedBooks = issuedBooks.map(issue => ({
        id: issue._id,
        bookTitle: issue.book.title,
        author: issue.book.author,
        coverImage: issue.book.coverImage,
        issueDate: issue.issueDate,
        dueDate: issue.dueDate,
        status: new Date() > issue.dueDate ? 'overdue' : 'issued',
        fine: calculateFine(issue.dueDate)
    }));

    res.json(ApiResponse.success('Issued books retrieved successfully', enhancedIssuedBooks));
});

exports.issueBook = catchAsync(async (req, res) => {
    const { bookId } = req.body;
    const studentId = req.user._id;

    // Check student's eligibility
    const activeIssues = await BookIssue.countDocuments({
        student: studentId,
        returnDate: null
    });

    if (activeIssues >= 3) {
        return res.status(400).json(
            ApiResponse.error('Maximum book issue limit reached (3 books)')
        );
    }

    // Check for overdue books
    const overdueBooks = await BookIssue.find({
        student: studentId,
        returnDate: null,
        dueDate: { $lt: new Date() }
    });

    if (overdueBooks.length > 0) {
        return res.status(400).json(
            ApiResponse.error('Cannot issue new books. Please return overdue books first')
        );
    }

    // Check book availability
    const book = await Book.findById(bookId);
    if (!book || !book.available) {
        return res.status(400).json(
            ApiResponse.error('Book is not available for issue')
        );
    }

    // Create issue record
    const issueRecord = await BookIssue.create({
        book: bookId,
        student: studentId,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    });

    // Update book availability
    book.available = false;
    await book.save();

    // Send notification
    await sendNotification({
        type: 'library',
        recipient: req.user.email,
        subject: 'Book Issued Successfully',
        message: `You have successfully borrowed "${book.title}". Due date: ${issueRecord.dueDate.toLocaleDateString()}`
    });

    res.json(ApiResponse.success('Book issued successfully', issueRecord));
});

exports.returnBook = catchAsync(async (req, res) => {
    const { issueId } = req.params;

    const bookIssue = await BookIssue.findOne({
        _id: issueId,
        student: req.user._id
    }).populate('book');

    if (!bookIssue) {
        return res.status(404).json(
            ApiResponse.error('Book issue record not found')
        );
    }

    const fine = calculateFine(bookIssue.dueDate);

    bookIssue.returnDate = new Date();
    bookIssue.fine = fine;
    await bookIssue.save();

    // Update book availability
    await Book.findByIdAndUpdate(bookIssue.book._id, { available: true });

    // Send notification
    await sendNotification({
        type: 'library',
        recipient: req.user.email,
        subject: 'Book Returned Successfully',
        message: `You have successfully returned "${bookIssue.book.title}". ${
            fine > 0 ? `Fine amount: ₹${fine}` : 'No fine applicable'
        }`
    });

    res.json(ApiResponse.success('Book returned successfully', {
        fine,
        returnDate: bookIssue.returnDate
    }));
});

// Helper function to calculate fine
const calculateFine = (dueDate) => {
    if (!dueDate || new Date() <= dueDate) return 0;
    
    const daysLate = Math.ceil(
        (new Date() - dueDate) / (1000 * 60 * 60 * 24)
    );
    return daysLate * 5; // ₹5 per day
};

module.exports = exports;