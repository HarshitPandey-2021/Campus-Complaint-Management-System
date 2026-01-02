// src/routes/users.js

// Import Express Router to define routes
const express = require("express");
const router = express.Router();

// Import user controllers
const { createUser, loginUser } = require("../controllers/usersController");

// No auth middleware here because register/login must be public

// Route: POST /api/auth/register
// Description: Create new user (student/admin) with validation
router.post("/register", createUser);

// Route: POST /api/auth/login
// Description: Login existing user and return JWT + user data
router.post("/login", loginUser);

// Export router for use in app.js
module.exports = router;
