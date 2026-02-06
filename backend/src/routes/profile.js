// Profile routes

const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { auth } = require("../middlewares/auth");

router.get("/", auth, profileController.getProfile);
router.put("/", auth, profileController.updateProfile);
router.get("/stats", auth, profileController.getProfileStats);

module.exports = router;

