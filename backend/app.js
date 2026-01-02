// app.js (backend entry for modular structure)

const express = require("express");
const app = express();
const dotenv = require("dotenv");

// Initialize environment variables from .env file
dotenv.config();

// Import DB initializer
const { initializeDB } = require("./src/config/db");

// Import route modules
const usersRoutes = require("./src/routes/users");
const complaintsRoutes = require("./src/routes/complaints");
const adminLogsRoutes = require("./src/routes/adminLogs");
const departmentsRoutes = require("./src/routes/departments");

// Import CORS to allow frontend origins
const cors = require("cors");

// Enable CORS for all origins (you can restrict to specific origins if needed)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Initialize database, then start server
initializeDB()
  .then(({ db, client }) => {
    // Store db and client in app.locals for use in controllers
    app.locals.db = db;
    app.locals.client = client;

    // Public auth routes: register and login
    app.use("/api/auth", usersRoutes);

    // Complaints routes (inside they use auth + requireRole where needed)
    app.use("/api/complaints", complaintsRoutes);

    // Admin logs routes (protected with auth + requireRole("admin"))
    app.use("/api/adminLogs", adminLogsRoutes);

    // Departments routes (also usually admin-only in route definitions)
    app.use("/api/departments", departmentsRoutes);

    // Simple health-check/test route
    app.get("/", (req, res) => res.send("API is running"));

    // Choose port from environment or default to 3000
    const PORT = process.env.PORT || 3000;

    // Start listening for HTTP requests
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // If DB initialization or server start fails, log and exit
    console.error("Error while initializing DB or starting server:", error);
    process.exit(1);
  });
