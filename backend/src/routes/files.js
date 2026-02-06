const express = require("express");
const router = express.Router();
const filesController = require("../controllers/filesController");

// File routes
router.get("/pdf/:publicId", filesController.proxyPdf);

module.exports = router;
