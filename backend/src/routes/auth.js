// Auth routes

const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { auth } = require("../middlewares/auth");

// Public auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/admin-session-code", authController.createAdminSessionCode);
router.post("/exchange-admin-code", authController.exchangeAdminCode);

// Protected auth routes
router.post("/change-password", auth, authController.changePassword);

module.exports = router;
