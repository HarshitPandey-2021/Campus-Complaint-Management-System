// src/routes/complaints.js
const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");
const {
  verifyToken,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

// 🧑‍🎓 STUDENT ROUTES

// Students submit new complaint
router.post("/",verifyToken,authorizeRoles("student"),complaintsController.createComplaint);

// Students view all complaints which they submitted
router.get("/my",verifyToken,authorizeRoles("student"),complaintsController.getUserComplaints);

// Students can check the status/details of a complaint they made
router.get("/:id",verifyToken,authorizeRoles("student"),complaintsController.getComplaintById);

// 🧑‍💼 ADMIN ROUTES

// Admins view all complaints
router.get("/admin/complaints", complaintsController.getAllComplaints);
// router.get("/admin/complaints", verifyToken, authorizeRoles("admin"), complaintsController.getAllComplaints);

// Admins update the status of complaint (e.g., mark as resolved)
router.put("/admin/:id", complaintsController.updateComplaintStatus);
// router.put("/admin/:id", verifyToken, authorizeRoles("admin"), complaintsController.updateComplaintStatus);

// Admin: Get complaint analytics
router.get("/admin/analytics", complaintsController.getAnalyticsData);
// router.get("/admin/analytics", verifyToken, authorizeRoles("admin"), complaintsController.getAnalyticsData);

// Mark a complaint as read (for notifications)
router.patch("/admin/:id/read", complaintsController.markComplaintAsRead);
// router.patch("/admin/:id/read",verifyToken,authorizeRoles("admin"),complaintsController.markComplaintAsRead);

// Admins can check the status/details of any complaint
router.get("/admin/:id", complaintsController.getComplaintById);
// router.get("/admin/:id",verifyToken,authorizeRoles("admin"),complaintsController.getComplaintById);
module.exports = router;
