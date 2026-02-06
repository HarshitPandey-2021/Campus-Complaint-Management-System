// Admin-only complaint routes

const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");
const { auth, requireRole } = require("../middlewares/auth");

router.put(
  "/:id/status",
  auth,
  requireRole("admin"),
  complaintsController.updateComplaintStatus
);
router.put(
  "/:id/assign",
  auth,
  requireRole("admin"),
  complaintsController.assignComplaint
);

module.exports = router;

