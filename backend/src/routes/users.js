// src/routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// ✅ Register (create a new user)
router.post('/register', usersController.createUser);

// ✅ Login (authenticate and get JWT)
router.post('/login', usersController.loginUser);

module.exports = router;
