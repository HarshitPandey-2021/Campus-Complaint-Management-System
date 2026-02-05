// backend/src/routes/complaints.js
const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");
const { auth, requireRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ==================== PUBLIC ROUTES (NO AUTH) ====================

// Get landing page stats (public endpoint)
router.get(
  "/public/stats",
  complaintsController.getLandingStats
);

// ==================== ADMIN ROUTES ====================

// Get all complaints
router.get(
  "/admin/all",
  auth,
  requireRole("admin"),
  complaintsController.getAllComplaints
);

// Get analytics
router.get(
  "/admin/analytics",
  auth,
  requireRole("admin"),
  complaintsController.getAnalyticsData
);

// ✅ FIXED: Get unread complaints (using the correct function)
router.get(
  "/admin/unread",
  auth,
  requireRole("admin"),
  complaintsController.getUnreadComplaints
);

// ✅ NEW: Admin update complaint (edit title, description, category, etc.)
router.put(
  "/admin/:id",
  auth,
  requireRole("admin"),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  complaintsController.updateComplaint
);

// Update complaint status (resolve, reject, start work)
router.put(
  "/admin/:id/status",
  auth,
  requireRole("admin"),
  complaintsController.updateComplaintStatus
);

// Mark complaint as read
router.patch(
  "/admin/:id/read",
  auth,
  requireRole("admin"),
  complaintsController.markComplaintAsRead
);

// Get complaint by ID (admin)
router.get(
  "/admin/:id",
  auth,
  requireRole("admin"),
  complaintsController.getComplaintById
);

// ==================== STUDENT ROUTES ====================

// Create new complaint
router.post(
  "/",
  auth,
  requireRole("student"),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  complaintsController.createComplaint
);

// Get my complaints
router.get(
  "/mine",
  auth,
  requireRole("student"),
  complaintsController.getUserComplaints
);

// Update my complaint (student only)
router.put(
  "/:id",
  auth,
  requireRole("student"),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  complaintsController.updateComplaint
);

// ==================== SHARED ROUTES ====================

// Get complaint by ID (role-based access in controller)
router.get(
  "/:id",
  auth,
  complaintsController.getComplaintById
);

module.exports = router;