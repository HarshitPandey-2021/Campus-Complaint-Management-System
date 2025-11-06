const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

// Check if the necessary environment variables are defined
if (!uri || !dbName) {
  throw new Error('MONGODB_URI or DB_NAME is not defined in .env');
}

// Initialize the MongoDB connection
async function initializeDB() {
  const client = new MongoClient(uri); // Removed deprecated options

  try {
    // Connect to the MongoDB server
    await client.connect();
    const db = client.db(dbName);  // Get the database

    console.log(`Connected to database: ${dbName}`);

    // Return the database and client for use in the app
    return { db, client };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;  // Throw the error to be caught in app.js
  }
}

module.exports = { initializeDB };
