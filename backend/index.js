require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

const app = express();

// ---------- CORS & BODY PARSING ----------
app.use(
  cors({
    origin: [
      "https://ccms-home.vercel.app",           // Landing
      "https://ccms-admin-rho.vercel.app",      // Admin
      "https://ccms-student.vercel.app",        // Student
      "http://localhost:5173",                  // Local admin
      "http://localhost:5174",                  // Local landing
      "http://localhost:3001",                  // Local user
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let db, Users, Complaints, AdminLogs, Departments;

// ---------- CLOUDINARY ----------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected"))
  .catch((err) => console.error("❌ Cloudinary FAILED:", err.message));

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { ...options, use_filename: true, unique_filename: true },
      (error, result) => {
        if (error) {
          console.error("Upload error:", error.message);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });

// ---------- MULTER ----------
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "images") {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image files allowed"), false);
    } else if (file.fieldname === "pdfDocument") {
      if (file.mimetype === "application/pdf") cb(null, true);
      else cb(new Error("Only PDF files allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

// ---------- HELPERS ----------
function toObjectId(id) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

function normalizeRole(role) {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "admin";
  return "student";
}

// ---------- AUTH MIDDLEWARE ----------
function auth(req, res, next) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Forbidden: ${role}s only` });
    }
    next();
  };
}

// ---------- MONGO CONNECTION ----------
async function start() {
  const client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  Users = db.collection("Users");
  Complaints = db.collection("Complaints");
  AdminLogs = db.collection("AdminLogs");
  Departments = db.collection("Departments");

  await Users.createIndex({ email: 1 }, { unique: true });
  await Departments.createIndex({ name: 1 }, { unique: true });
  await Complaints.createIndex({ userId: 1 });
  await Complaints.createIndex({ status: 1, priority: 1 });
  await Complaints.createIndex({ assignedTo: 1 });
  await Complaints.createIndex({ submittedAt: -1 });
  await Complaints.createIndex({ subject: "text", description: "text" });

  console.log("✅ MongoDB connected. DB:", dbName);
  app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});

// ---------- HEALTH & CLOUDINARY TEST ----------
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Keep-alive (NEW)
if (process.env.NODE_ENV === "production") {
  const keepAlive = () => {
    setInterval(() => {
      const url = process.env.RENDER_EXTERNAL_URL;
      if (url) {
        fetch(`${url}/health`)
          .then(() => console.log("✅ Keep-alive ping"))
          .catch((err) => console.log("❌ Ping failed:", err.message));
      }
    }, 14 * 60 * 1000); // 14 min
  };

  setTimeout(() => {
    keepAlive();
    console.log("🔄 Keep-alive started");
  }, 60 * 1000); // 1 min
}

app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const ping = await cloudinary.api.ping();
    res.json({
      status: "connected",
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      ping,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  }
});

app.get("/api/files/pdf/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const pdfUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      secure: true,
    });

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("PDF proxy error:", error);
    res.status(500).json({ message: "Failed to fetch PDF" });
  }
});

// ---------- AUTH ROUTES ----------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, roll } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedRole = normalizeRole(role);
    if (normalizedRole === "student" && !roll) {
      return res
        .status(400)
        .json({ message: "Roll number required for students" });
    }

    const existing = await Users.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date();

    const newUser = {
      name,
      email,
      password: hash,
      role: normalizedRole,
      ...(normalizedRole === "student" && { roll }),
      createdAt: now,
      updatedAt: now,
    };

    const r = await Users.insertOne(newUser);
    const userId = r.insertedId.toString();

    const payload = { userId, email, role: normalizedRole };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: {
        id: userId,
        _id: userId,
        name,
        email,
        role: normalizedRole,
        ...(normalizedRole === "student" && { roll }),
      },
    });
  } catch (e) {
    console.error("Register error:", e);
    const code = e.code === 11000 ? 409 : 500;
    res.status(code).json({ message: e.message || "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password, role: requestedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPwdValid = await bcrypt.compare(password, user.password);
    if (!isPwdValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const normalizedUserRole = normalizeRole(user.role);
    const normalizedRequestedRole = requestedRole
      ? normalizeRole(requestedRole)
      : null;

    if (
      normalizedRequestedRole &&
      normalizedRequestedRole !== normalizedUserRole
    ) {
      return res.status(403).json({
        message: `Access denied! Account (${email}) is "${normalizedUserRole}", not "${normalizedRequestedRole}". Use correct role.`,
      });
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: normalizedUserRole,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const { password: _, ...safeUser } = user;

    res.status(200).json({
      user: {
        ...safeUser,
        role: normalizedUserRole,
        id: user._id.toString(),
        _id: user._id.toString(),
      },
      token: accessToken,
      refreshToken: refreshToken || accessToken,
      role: normalizedUserRole,
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------- ONE-TIME ADMIN SESSION CODE ----------
const oneTimeCodes = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [code, data] of oneTimeCodes.entries()) {
    if (now - data.createdAt > 2 * 60 * 1000) {
      oneTimeCodes.delete(code);
    }
  }
}, 60 * 1000);

app.post("/api/auth/admin-session-code", async (req, res) => {
  try {
    const { token, refreshToken, user } = req.body;
    if (!token || !user || user.role !== "admin") {
      return res.status(400).json({ message: "Invalid admin session data" });
    }

    const code = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    oneTimeCodes.set(code, {
      token,
      refreshToken: refreshToken || null,
      user,
      createdAt: Date.now(),
    });

    console.log("✅ One-time code generated for admin:", user.email);
    res.json({ code });
  } catch (error) {
    console.error("Session code generation error:", error);
    res.status(500).json({ message: "Failed to generate session code" });
  }
});

app.post("/api/auth/exchange-admin-code", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Code required" });
    }

    const sessionData = oneTimeCodes.get(code);
    if (!sessionData) {
      return res.status(401).json({ message: "Invalid or expired code" });
    }

    const age = Date.now() - sessionData.createdAt;
    if (age > 2 * 60 * 1000) {
      oneTimeCodes.delete(code);
      return res.status(401).json({ message: "Code expired" });
    }

    oneTimeCodes.delete(code);
    console.log("✅ Code exchanged for admin:", sessionData.user.email);

    res.json({
      token: sessionData.token,
      refreshToken: sessionData.refreshToken,
      user: sessionData.user,
    });
  } catch (error) {
    console.error("Code exchange error:", error);
    res.status(500).json({ message: "Failed to exchange code" });
  }
});

// ---------- REFRESH TOKEN ----------
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token type" });
    }

    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }
});

// ---------- CHANGE PASSWORD ----------
app.post("/api/auth/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await Users.findOne({
      _id: toObjectId(req.user.userId),
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await Users.updateOne(
      { _id: toObjectId(req.user.userId) },
      { $set: { password: hash, updatedAt: new Date() } }
    );

    if (req.user.role === "admin") {
      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "CHANGE_PASSWORD",
        timestamp: new Date(),
      });
    }

    return res.json({ message: "Password changed successfully" });
  } catch (e) {
    console.error("Change password error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ---------- PROFILE ----------
app.get("/api/profile", auth, async (req, res) => {
  try {
    const user = await Users.findOne(
      { _id: toObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  } catch (e) {
    console.error("Profile fetch error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/profile", auth, async (req, res) => {
  try {
    const allowedFields = {};
    if ("name" in req.body) allowedFields.name = req.body.name;
    if ("phone" in req.body) allowedFields.phone = req.body.phone;
    allowedFields.updatedAt = new Date();

    await Users.updateOne(
      { _id: toObjectId(req.user.userId) },
      { $set: allowedFields }
    );

    res.json({ message: "Profile updated" });
  } catch (e) {
    console.error("Profile update error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/profile/stats", auth, async (req, res) => {
  try {
    const total = await Complaints.countDocuments({
      userId: req.user.userId,
    });

    const pending = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "Pending",
    });

    const inProgress = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "In Progress",
    });

    const resolved = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "Resolved",
    });

    res.json({ total, pending, inProgress, resolved });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ---------- COMPLAINTS: STUDENT & ADMIN ----------
app.post(
  "/api/complaints",
  auth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { subject, description, category, location, priority, isAnonymous } =
        req.body;

      if (!subject || !description || !category || !location) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided" });
      }

      const userId = req.user.userId;
      const user = await Users.findOne({ _id: toObjectId(userId) });
      if (!user) return res.status(404).json({ message: "User not found" });

      const imageUrls = [];
      if (req.files && req.files["images"]) {
        for (const file of req.files["images"]) {
          try {
            const result = await uploadToCloudinary(file.buffer, {
              folder: "campus-complaints/images",
              resource_type: "image",
              transformation: {
                width: 1200,
                quality: "auto",
                crop: "limit",
              },
            });
            imageUrls.push(result.secure_url);
          } catch (imgError) {
            console.error("Image upload failed:", imgError.message);
          }
        }
      }

      let pdfUrl = null;
      let pdfPublicId = null;

      if (
        req.files &&
        req.files["pdfDocument"] &&
        req.files["pdfDocument"][0]
      ) {
        try {
          const result = await uploadToCloudinary(
            req.files["pdfDocument"][0].buffer,
            {
              folder: "campus-complaints/documents",
              resource_type: "raw",
              format: "pdf",
              type: "upload",
              access_mode: "public",
            }
          );

          pdfUrl = result.secure_url;
          pdfPublicId = result.public_id;
        } catch (pdfError) {
          console.error("PDF upload failed:", pdfError.message);
          pdfUrl = null;
        }
      }

      const complaintCount = await Complaints.countDocuments();
      const complaintId = `CMP${String(complaintCount + 1).padStart(
        5,
        "0"
      )}`;

      const now = new Date();
      const complaint = {
        complaintId,
        userId,
        submittedBy: user.name,
        email: user.email,
        subject,
        title: subject,
        description,
        category,
        location,
        priority: priority || "Medium",
        images: imageUrls,
        pdfDocument: pdfUrl,
        pdfPublicId,
        status: "Pending",
        assignedTo: null,
        adminRemarks: "",
        isAnonymous:
          isAnonymous === "true" || isAnonymous === true ? true : false,
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
        readByAdmin: false,
        readAt: null,
        timeline: [
          {
            status: "Pending",
            timestamp: now,
            message: "Complaint submitted",
          },
        ],
      };

      const r = await Complaints.insertOne(complaint);

      res.status(201).json({
        id: r.insertedId,
        complaintId: complaint.complaintId,
        message: "Complaint submitted successfully",
        complaint: { ...complaint, id: r.insertedId },
      });
    } catch (e) {
      console.error("Error submitting complaint:", e);
      res
        .status(500)
        .json({ message: "Internal server error", error: e.message });
    }
  }
);

app.get("/api/complaints/mine", auth, async (req, res) => {
  try {
    const complaints = await Complaints.find({ userId: req.user.userId })
      .sort({ submittedAt: -1 })
      .toArray();

    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    res.json(transformed);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/complaints/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const complaint = await Complaints.findOne({ _id: toObjectId(id) });
    if (!complaint) {
      return res.status(404).json({ message: "Not found" });
    }

    if (
      req.user.role !== "admin" &&
      String(complaint.userId) !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const transformed = {
      ...complaint,
      title: complaint.title || complaint.subject,
      createdAt: complaint.createdAt || complaint.submittedAt,
    };

    res.json(transformed);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put(
  "/api/complaints/:id",
  auth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const complaint = await Complaints.findOne({ _id: toObjectId(id) });
      if (!complaint) {
        return res.status(404).json({ message: "Not found" });
      }

      if (req.user.role !== "admin") {
        if (String(complaint.userId) !== req.user.userId) {
          return res.status(403).json({ message: "Not allowed to edit" });
        }

        if (complaint.status !== "Pending") {
          return res
            .status(403)
            .json({ message: "Cannot edit non-pending complaint" });
        }

        if (complaint.assignedTo) {
          return res
            .status(403)
            .json({ message: "Cannot edit assigned complaint" });
        }
      }

      const {
        subject,
        description,
        category,
        priority,
        location,
        isAnonymous,
        existingImages,
        existingPdf,
      } = req.body;

      const updateFields = { updatedAt: new Date() };

      if (subject) {
        updateFields.subject = subject;
        updateFields.title = subject;
      }
      if (description) updateFields.description = description;
      if (category) updateFields.category = category;
      if (priority) updateFields.priority = priority;
      if (location) updateFields.location = location;
      if (typeof isAnonymous !== "undefined") {
        updateFields.isAnonymous =
          isAnonymous === "true" || isAnonymous === true;
      }

      let finalImages = [];
      if (existingImages) {
        if (Array.isArray(existingImages)) {
          finalImages = [...existingImages];
        } else if (typeof existingImages === "string") {
          try {
            finalImages = JSON.parse(existingImages);
          } catch {
            finalImages = [existingImages];
          }
        }
      }

      if (req.files && req.files["images"]) {
        for (const file of req.files["images"]) {
          try {
            const result = await uploadToCloudinary(file.buffer, {
              folder: "campus-complaints/images",
              resource_type: "image",
              transformation: {
                width: 1200,
                quality: "auto",
                crop: "limit",
              },
            });
            finalImages.push(result.secure_url);
          } catch (imgError) {
            console.error("Image upload failed:", imgError.message);
          }
        }
      }

      updateFields.images = finalImages;

      if (existingPdf && existingPdf !== "null" && existingPdf !== "") {
        updateFields.pdfDocument = existingPdf;
      } else if (
        req.files &&
        req.files["pdfDocument"] &&
        req.files["pdfDocument"][0]
      ) {
        try {
          const result = await uploadToCloudinary(
            req.files["pdfDocument"][0].buffer,
            {
              folder: "campus-complaints/documents",
              resource_type: "raw",
              format: "pdf",
              type: "upload",
              access_mode: "public",
            }
          );

          updateFields.pdfDocument = result.secure_url;
          updateFields.pdfPublicId = result.public_id;
        } catch (pdfError) {
          console.error("PDF upload failed:", pdfError.message);
        }
      } else if (!existingPdf || existingPdf === "null" || existingPdf === "") {
        updateFields.pdfDocument = null;
        updateFields.pdfPublicId = null;
      }

      const update = await Complaints.updateOne(
        { _id: toObjectId(id) },
        { $set: updateFields }
      );

      if (!update.matchedCount) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      const updatedComplaint = await Complaints.findOne({
        _id: toObjectId(id),
      });

      const transformed = {
        ...updatedComplaint,
        title: updatedComplaint.title || updatedComplaint.subject,
        createdAt:
          updatedComplaint.createdAt || updatedComplaint.submittedAt,
      };

      res.json({
        message: "Complaint updated successfully",
        complaint: transformed,
      });
    } catch (e) {
      console.error("Update error:", e);
      res
        .status(500)
        .json({ message: "Internal server error", error: e.message });
    }
  }
);

app.get("/api/complaints", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "admin" ? {} : { userId: req.user.userId };

    const complaints = await Complaints.find(query)
      .sort({ submittedAt: -1 })
      .toArray();

    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    res.json(transformed);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all complaints for admin (alternative endpoint)
app.get(
  "/api/complaints/admin/all",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const complaints = await Complaints.find({})
        .sort({ submittedAt: -1 })
        .toArray();

      const transformed = complaints.map((c) => ({
        ...c,
        title: c.title || c.subject,
        createdAt: c.createdAt || c.submittedAt,
      }));

      console.log(`✅ Returning ${transformed.length} complaints to admin`);
      res.json(transformed);
    } catch (err) {
      console.error("Error fetching all complaints:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ---------- ADMIN COMPLAINTS ----------
app.put(
  "/api/admin/complaints/:id/status",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminRemarks, assignedTo } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const updateFields = { updatedAt: new Date() };

      if (status) {
        updateFields.status = status;
        const timelineEntry = {
          status,
          timestamp: new Date(),
          message: `Status changed to ${status}`,
        };

        await Complaints.updateOne(
          { _id: toObjectId(id) },
          { $push: { timeline: timelineEntry } }
        );
      }

      if (adminRemarks) updateFields.adminRemarks = adminRemarks;
      if (assignedTo) updateFields.assignedTo = assignedTo;
      if (status === "Resolved") updateFields.resolvedAt = new Date();

      const result = await Complaints.updateOne(
        { _id: toObjectId(id) },
        { $set: updateFields }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "UPDATE_COMPLAINT_STATUS",
        complaintId: id,
        details: { status, adminRemarks, assignedTo },
        timestamp: new Date(),
      });

      res.json({ message: "Complaint status updated" });
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.put(
  "/api/admin/complaints/:id/assign",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await Complaints.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            assignedTo,
            status: "In Progress",
            updatedAt: new Date(),
          },
          $push: {
            timeline: {
              status: "In Progress",
              timestamp: new Date(),
              message: `Assigned to ${assignedTo}`,
            },
          },
        }
      );

      res.json({ message: "Complaint assigned successfully" });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get(
  "/api/complaints/admin/unread",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      let unread = await Complaints.find({
        $or: [{ readByAdmin: { $exists: false } }, { readByAdmin: false }],
      })
        .sort({ submittedAt: -1 })
        .limit(10)
        .toArray();

      if (!unread || unread.length === 0) {
        unread = await Complaints.find()
          .sort({ submittedAt: -1 })
          .limit(10)
          .toArray();
      }

      const transformed = unread.map((c) => ({
        ...c,
        title: c.title || c.subject,
        createdAt: c.createdAt || c.submittedAt,
      }));

      res.json(transformed);
    } catch (error) {
      console.error("Unread complaints error:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch unread complaints" });
    }
  }
);

app.patch(
  "/api/complaints/admin/:id/read",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ message: "Invalid complaint ID" });
      }

      const result = await Complaints.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            readByAdmin: true,
            readAt: new Date(),
          },
        }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "MARK_COMPLAINT_READ",
        complaintId: id,
        timestamp: new Date(),
      });

      res.json({ message: "Marked as read" });
    } catch (error) {
      console.error("Error marking as read:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ---------- ADMIN ANALYTICS (UPDATED) ----------
app.get(
  "/api/complaints/admin/analytics",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      // --- Basic counts ---
      const total = await Complaints.countDocuments();
      const pending = await Complaints.countDocuments({ status: "Pending" });
      const inProgress = await Complaints.countDocuments({
        status: "In Progress",
      });
      const resolved = await Complaints.countDocuments({ status: "Resolved" });
      const rejected = await Complaints.countDocuments({ status: "Rejected" });

      // --- By Category ---
      const categoryStats = await Complaints.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]).toArray();

      // --- By Priority ---
      const priorityStats = await Complaints.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$priority", "UNKNOWN"] },
            count: { $sum: 1 },
          },
        },
      ]).toArray();

      // Convert priorityStats to object: { High: 10, Medium: 5, ... }
      const byPriority = {};
      priorityStats.forEach((p) => {
        const key = p._id || "UNKNOWN";
        byPriority[key] = p.count || 0;
      });

      // --- Average resolution time (in hours) ---
      const resolutionAgg = await Complaints.aggregate([
        {
          $match: {
            status: "Resolved",
            resolvedAt: { $ne: null },
            submittedAt: { $ne: null },
          },
        },
        {
          $project: {
            diffHours: {
              $divide: [
                { $subtract: ["$resolvedAt", "$submittedAt"] },
                1000 * 60 * 60, // ms -> hours
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: "$diffHours" },
          },
        },
      ]).toArray();

      const avgResolutionTime =
        resolutionAgg.length > 0 ? resolutionAgg[0].avgHours : 0;

      // --- Response structure compatible with Analytics.jsx ---
      res.json({
        stats: {
          total,
          pending,
          inProgress,
          resolved,
          rejected,
        },
        categories: categoryStats, // array
        byCategory: null, // optional
        categoryStats, // same as categories
        byPriority, // object { High: 10, Medium: 5, ... }
        priorities: priorityStats, // array [{ _id: 'High', count: 10 }, ...]
        avgResolutionTime, // hours (float)
      });
    } catch (e) {
      console.error("Analytics error:", e);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  }
);

// ---------- 404 & ERROR HANDLERS ----------
app.use((req, res) => {
  res.status(404).json({ message: "URL not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Max 10MB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ message: "Too many files. Max 6 files." });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }

  next();
});

module.exports = app;
