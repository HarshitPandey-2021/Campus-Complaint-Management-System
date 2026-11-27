const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const complaintsRoutes = require("./routes/complaints");
const adminComplaintsRoutes = require("./routes/adminComplaints");
const filesRoutes = require("./routes/files");
const healthRoutes = require("./routes/health");

const app = express();

// Basic security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS settings
app.use(
  cors({
    origin: [
      "https://ccms-home.vercel.app",
      "https://ccms-admin-rho.vercel.app",
      "https://ccms-student.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/admin/complaints", adminComplaintsRoutes);
app.use("/api/files", filesRoutes);
app.use("/", healthRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "URL not found" });
});

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max 10MB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Max 6 files." });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    console.error("Server error:", err);
    const isProd = process.env.NODE_ENV === "production";
    return res.status(500).json({
      message: isProd ? "Internal server error" : err.message || "Internal server error",
    });
  }

  next();
});

module.exports = app;
