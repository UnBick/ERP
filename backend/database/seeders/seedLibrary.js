require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Book = require('../../src/modules/library/models/bookModel');

const sampleBooks = [
    {
        title: "Introduction to Programming",
        author: "John Doe",
        isbn: "1234567890",
        category: "academic",
        description: "Learn programming basics",
        totalCopies: 5,
        availableCopies: 5,
        isActive: true,
        location: "A1",
        createdAt: new Date()
    },
    {
        title: "Data Structures and Algorithms",
        author: "Jane Smith",
        isbn: "0987654321",
        category: "academic",
        description: "Advanced programming concepts",
        totalCopies: 3,
        availableCopies: 3,
        isActive: true,
        location: "A2",
        createdAt: new Date()
    }
    // Add more sample books as needed
];

async function seedLibrary() {
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
        console.log('Inserted sample books');

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding library:', error);
        process.exit(1);
    }
}

seedLibrary();