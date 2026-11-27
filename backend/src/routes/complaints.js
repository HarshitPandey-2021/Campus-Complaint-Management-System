const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");
const { auth, requireRole } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// Student complaint routes
router.post(
  "/",
  auth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  complaintsController.createComplaint
);

router.get("/mine", auth, complaintsController.getUserComplaints);

// Admin complaint routes
router.get(
  "/admin/all",
  auth,
  requireRole("admin"),
  complaintsController.getAllComplaints
);

router.get(
  "/admin/analytics",
  auth,
  requireRole("admin"),
  complaintsController.getAnalytics
);

router.get(
  "/admin/unread",
  auth,
  requireRole("admin"),
  complaintsController.getUnreadComplaints
);

router.patch(
  "/admin/:id/read",
  auth,
  requireRole("admin"),
  complaintsController.markComplaintRead
);

// Public stats routes
router.get("/public/stats", complaintsController.getPublicStats);

router.get("/:id", auth, complaintsController.getComplaintById);

router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  complaintsController.updateComplaint
);

router.get("/", auth, complaintsController.listComplaints);

module.exports = router;
