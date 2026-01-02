// src/routes/adminLogs.js

// Import Express Router
const express = require("express");
const router = express.Router();

// Import controller
const { getAdminLogs } = require("../controllers/adminLogsController");

// Import authentication middlewares
const { auth, requireRole } = require("../middleware/authMiddleware");

// Route: GET /api/adminLogs
// Description: Fetch logs for current admin
// Middlewares:
//  - auth: checks valid JWT
//  - requireRole("admin"): only admins can access logs
router.get("/", auth, requireRole("admin"), getAdminLogs);

// Export router
module.exports = router;
