// backend/app.js
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { initializeDB } = require('./src/config/db'); // Import the database initialization

// Import routes
const usersRoutes = require('./src/routes/users');
const complaintsRoutes = require('./src/routes/complaints');
const adminLogsRoutes = require('./src/routes/adminLogs');
const departmentsRoutes = require('./src/routes/departments');


const cors = require('cors');
app.use(cors()); // Enable CORS for all routes

// Configure environment variables
dotenv.config();

// Middleware for parsing JSON
app.use(express.json());

// Initialize MongoDB connection
initializeDB()
  .then(({ db, client }) => {
    // Store the db object in app.locals for use in controllers
    app.locals.db = db;
    app.locals.client = client;

    // Use the routes
    app.use('/api/users', usersRoutes);
    app.use('/api/complaints', complaintsRoutes);
    app.use('/api/adminLogs', adminLogsRoutes);
    app.use('/api/departments', departmentsRoutes);

    // Home route
    app.get('/', (req, res) => {
      res.send('API is running');
    });

    // Port to listen on
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error while initializing DB or starting server:', error);
    process.exit(1); // Exit if DB connection fails
  });
