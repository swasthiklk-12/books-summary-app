// migrateSeed route
console.log("migrateSeed route loaded");
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/book');
const seedData = require('../seed-data');

// Shared handler for migration and seeding
async function handleMigrateSeed(req, res) {
  console.log("handleMigrateSeed called!");
  try {
    // Ensure DB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Check your .env MONGODB_URI.'
      });
    }

    const collectionName = Book.collection.collectionName;

    // Drop existing collection if it exists
    const collections = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      await mongoose.connection.db.dropCollection(collectionName);
      console.log(`Dropped existing collection: ${collectionName}`);
    }

    // Seed data
    const books = await Book.insertMany(seedData);

    res.status(201).json({
      success: true,
      message: 'Migration and seeding completed successfully!',
      data: {
        collection: collectionName,
        booksCreated: books.length,
        books: books
      }
    });
  } catch (error) {
    console.error('Migration/Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Migration and seeding failed',
      error: error.message
    });
  }
}

module.exports = handleMigrateSeed;
