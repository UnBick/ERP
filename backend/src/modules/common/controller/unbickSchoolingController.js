// backend/src/controllers/unbickSchoolingController.js
const UnbickSchoolingModel = require('../models/unbickSchoolingModel');

// Fetch all books
exports.getBooks = async (req, res) => {
  try {
    const books = await UnbickSchoolingModel.find().select('books');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books', error });
  }
};

// Add a new book
exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, gradeLevel } = req.body;
    const newBook = { title, author, isbn, gradeLevel };
    const result = await UnbickSchoolingModel.updateOne(
      {},
      { $push: { books: newBook } },
      { upsert: true }
    );
    res.status(201).json({ message: 'Book added successfully', result });
  } catch (error) {
    res.status(500).json({ message: 'Error adding book', error });
  }
};

// Fetch predefined syllabi
exports.getPredefinedSyllabi = async (req, res) => {
  try {
    const syllabi = await UnbickSchoolingModel.find({ 'syllabi.predefined': true });
    res.status(200).json(syllabi);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching syllabi', error });
  }
};
