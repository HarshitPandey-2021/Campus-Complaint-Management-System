// src/routes/complaints.js
const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

// =========================================================
// 🧑‍💼 ADMIN ROUTES (Place BEFORE generic routes to avoid conflicts)
// =========================================================

// Admin: View all complaints
router.get(
  "/admin/all",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.getAllComplaints
);

// Admin: Get complaint analytics
router.get(
  "/admin/analytics",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.getAnalyticsData
);

// Admin: Update complaint status
router.put(
  "/admin/:id/status",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.updateComplaintStatus
);

// Admin: Mark complaint as read
router.patch(
  "/admin/:id/read",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.markComplaintAsRead
);

// Admin: Get complaint by ID
router.get(
  "/admin/:id",
  verifyToken,
  authorizeRoles("admin"),
  complaintsController.getComplaintById
);

// =========================================================
// 🧑‍🎓 STUDENT ROUTES
// =========================================================

// Students: Submit new complaint WITH FILE UPLOAD
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

// Students: View their own complaints
router.get(
  "/mine",
  verifyToken,
  authorizeRoles("student"),
  complaintsController.getUserComplaints
);

// Students: Update their pending complaints
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

// =========================================================
// 🔄 SHARED ROUTES (Student + Admin with role-based logic)
// =========================================================

// Get complaint by ID (role-based access control inside controller)
router.get(
  "/:id",
  verifyToken,
  complaintsController.getComplaintById
);

module.exports = router;
