require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Book = require('../../src/modules/library/models/bookModel');
const sampleBooks = require('../../src/data/sampleBooks');

async function seedBooks() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing books
        await Book.deleteMany({});
        console.log('Cleared existing books');

        // Insert sample books
        await Book.insertMany(sampleBooks);
        console.log('Sample books inserted successfully');

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding books:', error);
        process.exit(1);
    }
}

seedBooks();