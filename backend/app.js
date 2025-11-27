const express = require('express');
const app = express();
const dotenv = require('dotenv');
const { initializeDB } = require('./src/config/db');

// Import routes
const usersRoutes = require('./src/routes/users');
const complaintsRoutes = require('./src/routes/complaints');
const adminLogsRoutes = require('./src/routes/adminLogs');
const departmentsRoutes = require('./src/routes/departments');

const cors = require('cors');
app.use(cors());
dotenv.config();
app.use(express.json());

initializeDB()
  .then(({ db, client }) => {
    app.locals.db = db;
    app.locals.client = client;

    // ✅ BEST PRACTICE: Standard auth endpoints
    app.use('/api/auth', usersRoutes);         // Handles /register and /login
    app.use('/api/complaints', complaintsRoutes);
    app.use('/api/adminLogs', adminLogsRoutes);
    app.use('/api/departments', departmentsRoutes);

    app.get('/', (req, res) => res.send('API is running'));
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error while initializing DB or starting server:', error);
    process.exit(1);
  });
