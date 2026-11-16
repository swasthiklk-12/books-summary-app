const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const booksRouter = require('./routes/books');
// const migrateSeedRouter = require('./routes/migrateSeed');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/books-db';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/books', booksRouter);
app.get('/migrate-seed', async (req, res) => {
  const Book = require('./models/book');
  const seedData = require('./seed-data');
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database not connected.' });
    }
    const collectionName = Book.collection.collectionName;
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.dropCollection(collectionName);
    }
    const books = await Book.insertMany(seedData);
    res.status(201).json({ success: true, message: 'Migration and seeding completed successfully!', data: { booksCreated: books.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Migration and seeding failed', error: error.message });
  }
});
// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Books API is running!',
    endpoints: {
      getAllBooks: '/api/books',
      getBookById: '/api/books/:id',
      migrateAndSeed: '/migrate-seed'
    }
  });
});

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Migrate & Seed: http://localhost:${PORT}/migrate-seed`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    // Still start the server so the user can see the error via API
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
      console.log('WARNING: MongoDB connection failed. Check your .env MONGODB_URI.');
    });
  });
