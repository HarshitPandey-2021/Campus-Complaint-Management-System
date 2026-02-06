const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");

// Health routes
router.get("/health", healthController.health);
router.get("/api/test-cloudinary", healthController.testCloudinary);

module.exports = router;
