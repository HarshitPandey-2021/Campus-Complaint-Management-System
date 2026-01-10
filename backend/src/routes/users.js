// backend/src/routes/users.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// Public routes (no authentication required)
router.post("/login", usersController.loginUser);
router.post("/register", usersController.registerUser);
router.post("/refresh", usersController.refreshToken);

module.exports = router;
