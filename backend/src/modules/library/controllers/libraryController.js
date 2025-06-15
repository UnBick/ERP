const mongoose = require('mongoose');
const ApiResponse = require('../../../utils/apiResponse');

// Get models safely
const getBookModel = () => mongoose.models.Book || mongoose.model('Book');
const getBookIssueModel = () => mongoose.models.BookIssue || mongoose.model('BookIssue');

// Explicitly define all controller methods
const libraryController = {
    getBooks: async (req, res) => {
        try {
            const BookModel = getBookModel();
            const { search = '', category = '', availability = 'all' } = req.query;
            
            let query = { isActive: true };
            
            if (search) {
                query.$or = [
                    { title: new RegExp(search, 'i') },
                    { author: new RegExp(search, 'i') },
                    { isbn: new RegExp(search, 'i') }
                ];
            }
            
            if (category) {
                query.category = category;
            }
            
            if (availability === 'available') {
                query.availableCopies = { $gt: 0 };
            } else if (availability === 'issued') {
                query.availableCopies = 0;
            }

            const books = await BookModel.find(query)
                .select('-__v')
                .sort({ title: 1 });

            const formattedBooks = books.map(book => ({
                id: book._id,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                category: book.category,
                description: book.description,
                coverImage: book.coverImage || '/images/default-book-cover.png',
                available: book.availableCopies > 0,
                totalCopies: book.totalCopies,
                availableCopies: book.availableCopies,
                location: book.location
            }));

            return res.json(ApiResponse.success('Books retrieved successfully', formattedBooks));
        } catch (error) {
            console.error('Error fetching books:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to fetch books')
            );
        }
    },

    getRecommendations: async (req, res) => {
        try {
            const BookModel = getBookModel();
            console.log('Fetching recommendations...');
            // Get default recommendations
            const defaultRecommendations = await BookModel.find({
                isActive: true,
                availableCopies: { $gt: 0 }
            })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean(); // Use lean() for better performance

            console.log('Found recommendations:', defaultRecommendations.length);

            const formattedBooks = defaultRecommendations.map(book => ({
                id: book._id,
                title: book.title,
                author: book.author,
                category: book.category,
                coverImage: book.coverImage || '/images/default-book-cover.png',
                available: book.availableCopies > 0,
                availableCopies: book.availableCopies,
                totalCopies: book.totalCopies,
                description: book.description
            }));

            return res.json(
                ApiResponse.success('Recommendations retrieved successfully', formattedBooks)
            );
        } catch (error) {
            console.error('Error getting recommendations:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to fetch recommendations')
            );
        }
    },

    getIssuedBooks: async (req, res) => {
        try {
            const BookIssueModel = getBookIssueModel();
            const userId = req.user?._id;
            const issuedBooks = await BookIssueModel.find({ 
                userId,
                returnDate: null
            })
            .populate('bookId')
            .sort({ issueDate: -1 });

            const formattedIssues = issuedBooks.map(issue => ({
                id: issue._id,
                bookTitle: issue.bookId.title,
                bookId: issue.bookId._id,
                issueDate: issue.issueDate,
                dueDate: issue.dueDate,
                status: new Date() > new Date(issue.dueDate) ? 'overdue' : 'issued'
            }));

            return res.json(ApiResponse.success('Issued books retrieved successfully', formattedIssues));
        } catch (error) {
            console.error('Error fetching issued books:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to fetch issued books')
            );
        }
    },

    issueBook: async (req, res) => {
        try {
            const BookModel = getBookModel();
            const BookIssueModel = getBookIssueModel();
            const { bookId, userId, userModel = 'Staff' } = req.body;

            // Validate required fields
            if (!bookId || !userId) {
                return res.status(400).json(
                    ApiResponse.error('Book ID and User ID are required')
                );
            }

            // Check if book exists and is available
            const book = await BookModel.findById(bookId);
            if (!book) {
                return res.status(404).json(
                    ApiResponse.error('Book not found')
                );
            }

            if (book.availableCopies <= 0) {
                return res.status(400).json(
                    ApiResponse.error('Book is not available')
                );
            }

            // Check if user already has this book issued
            const existingIssue = await BookIssueModel.findOne({
                bookId,
                userId,
                returnDate: null
            });

            if (existingIssue) {
                return res.status(400).json(
                    ApiResponse.error('User already has this book issued')
                );
            }

            // Calculate due date (14 days from now)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            // Create issue record
            const issue = await BookIssueModel.create({
                bookId,
                userId,
                userModel,
                issueDate: new Date(),
                dueDate,
                status: 'issued'
            });

            // Update book availability
            await BookModel.findByIdAndUpdate(bookId, {
                $inc: { availableCopies: -1 }
            });

            // Return success response
            return res.status(200).json(
                ApiResponse.success('Book issued successfully', {
                    issue,
                    dueDate
                })
            );

        } catch (error) {
            console.error('Error issuing book:', error);
            return res.status(500).json(
                ApiResponse.error(error.message || 'Failed to issue book')
            );
        }
    },

    returnBook: async (req, res) => {
        try {
            const BookModel = getBookModel();
            const BookIssueModel = getBookIssueModel();
            const { id } = req.params;
            const issue = await BookIssueModel.findById(id);

            if (!issue) {
                return res.status(404).json(
                    ApiResponse.error('Issue record not found')
                );
            }

            issue.returnDate = new Date();
            await issue.save();

            // Update book availability
            await BookModel.findByIdAndUpdate(issue.bookId, {
                $inc: { availableCopies: 1 }
            });

            return res.json(ApiResponse.success('Book returned successfully'));
        } catch (error) {
            console.error('Error returning book:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to return book')
            );
        }
    },

    payFine: async (req, res) => {
        try {
            const BookIssueModel = getBookIssueModel();
            const { issueId, amount } = req.body;
            
            const issue = await BookIssueModel.findByIdAndUpdate(issueId, {
                'fine.paid': true,
                'fine.paidDate': new Date(),
                'fine.amount': amount
            }, { new: true });

            return res.json(ApiResponse.success('Fine paid successfully', issue));
        } catch (error) {
            console.error('Error processing fine payment:', error);
            return res.status(500).json(
                ApiResponse.error('Failed to process fine payment')
            );
        }
    }
};

// Ensure all required methods are exported
module.exports = {
    getBooks: libraryController.getBooks,
    getRecommendations: libraryController.getRecommendations,
    getIssuedBooks: libraryController.getIssuedBooks,
    issueBook: libraryController.issueBook,
    returnBook: libraryController.returnBook,
    payFine: libraryController.payFine
};
