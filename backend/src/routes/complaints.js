// src/routes/complaints.js
const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

// 🧑‍🎓 STUDENT ROUTES

// Students submit new complaint WITH FILE UPLOAD
router.post(
  "/",
  verifyToken,
  authorizeRoles("student"),
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'pdfDocument', maxCount: 1 }
  ]),
  complaintsController.createComplaint
);

// Students view all complaints which they submitted
router.get(
  "/mine",  // Changed from "/my" to "/mine"
  verifyToken,
  authorizeRoles("student"),
  complaintsController.getUserComplaints
);

// Students can update their pending complaints
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("student"),
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'pdfDocument', maxCount: 1 }
  ]),
  complaintsController.updateComplaint
);

// Students can check the status/details of a complaint they made
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("student"),
  complaintsController.getComplaintById
);

// 🧑‍💼 ADMIN ROUTES

// Admins view all complaints
router.get(
  "/admin/all",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.getAllComplaints
);

// Admins update the status of complaint (e.g., mark as resolved)
router.put(
  "/admin/:id/status",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.updateComplaintStatus
);

// Admin: Get complaint analytics
router.get(
  "/admin/analytics",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.getAnalyticsData
);

// Mark a complaint as read (for notifications)
router.patch(
  "/admin/:id/read",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.markComplaintAsRead
);

// Admins can check the status/details of any complaint
router.get(
  "/admin/:id",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.getComplaintById
);

module.exports = router;
