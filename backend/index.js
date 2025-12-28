// src/index.js (backend)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

// Increase payload limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let db, Users, Complaints, AdminLogs, Departments;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Test Cloudinary connection
cloudinary.api
  .ping()
  .then(() => console.log('✅ Cloudinary connected successfully'))
  .catch((err) => console.error('❌ Cloudinary connection FAILED:', err.message));

console.log('Cloudinary Configured:', process.env.CLOUDINARY_CLOUD_NAME);

// Multer Memory Storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 6,
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer processing file:', file.fieldname, file.mimetype);

    if (file.fieldname === 'images') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files allowed'), false);
      }
    } else if (file.fieldname === 'pdfDocument') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files allowed'), false);
      }
    } else {
      cb(null, true);
    }
  },
});

// Upload to Cloudinary Helper
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    console.log('📤 Starting Cloudinary upload:', options.folder);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        ...options,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error.message);
          reject(error);
        } else {
          console.log('✅ Upload successful:', result.secure_url);
          console.log('📎 Public ID:', result.public_id);
          resolve(result);
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

// --- Middleware ---
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

function toObjectId(id) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

// --- MongoDB Connect ---
async function start() {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  Users = db.collection('Users');
  Complaints = db.collection('Complaints');
  AdminLogs = db.collection('AdminLogs');
  Departments = db.collection('Departments');

  // Indexes
  await Users.createIndex({ email: 1 }, { unique: true });
  await Departments.createIndex({ name: 1 }, { unique: true });
  await Complaints.createIndex({ userId: 1 });
  await Complaints.createIndex({ status: 1, priority: 1 });
  await Complaints.createIndex({ assignedTo: 1 });
  await Complaints.createIndex({ submittedAt: -1 });
  await Complaints.createIndex({ subject: 'text', description: 'text' });

  console.log('Connected to MongoDB. DB:', dbName);
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error('Failed to start server:', e);
  process.exit(1);
});

// --- Health ---
app.get('/health', (_, res) => res.json({ ok: true }));

// Test Cloudinary Route
app.get('/api/test-cloudinary', async (req, res) => {
  try {
    const pingResult = await cloudinary.api.ping();
    res.json({
      status: 'connected',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      ping: pingResult,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  }
});

// PDF Proxy route
app.get('/api/files/pdf/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;

    const pdfUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      secure: true,
    });

    const response = await fetch(pdfUrl);

    if (!response.ok) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('PDF proxy error:', error);
    res.status(500).json({ message: 'Failed to fetch PDF' });
  }
});

// --- Auth: Register ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, roll } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (role === 'student' && !roll) {
      return res.status(400).json({ message: 'Roll number required for students' });
    }
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existing = await Users.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date();
    const newUser = {
      name,
      email,
      password: hash,
      role,
      ...(role === 'student' && { roll }),
      createdAt: now,
      updatedAt: now,
    };

    const r = await Users.insertOne(newUser);
    const userId = r.insertedId.toString();
    const token = jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    res.status(201).json({
      user: { id: userId, name, email, role, ...(role === 'student' && { roll }) },
      token,
    });
  } catch (e) {
    const code = e.code === 11000 ? 409 : 500;
    res.status(code).json({ message: e.message || 'Internal server error' });
  }
});

// --- Auth: Login ---
// ✅ FIX 1: ROLE LOGIN - BLOCK WRONG ROLE (CRITICAL)
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role: requestedRole } = req.body; // ✅ requestedRole from frontend
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPwdValid = await bcrypt.compare(password, user.password);
    if (!isPwdValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // ✅ CRITICAL FIX: BLOCK WRONG ROLE LOGIN
    console.log(`🔐 Login attempt: ${email} requested ${requestedRole}, actual ${user.role}`);
    
    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({ 
        message: `Access denied! This account (${email}) is registered as **${user.role}**, not **${requestedRole}**. Please use correct role selection.` 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email, 
        role: user.role 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const { password: _, ...safeUser } = user;
    
    res.status(200).json({ 
      user: safeUser, 
      token,
      role: user.role // ✅ Explicit role return
    });
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


// --- Get Profile ---
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await Users.findOne(
      { _id: toObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );
    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Update Profile ---
app.put('/api/profile', auth, async (req, res) => {
  try {
    const allowedFields = {};
    if ('name' in req.body) allowedFields.name = req.body.name;
    if ('phone' in req.body) allowedFields.phone = req.body.phone;
    allowedFields.updatedAt = new Date();

    await Users.updateOne({ _id: toObjectId(req.user.userId) }, { $set: allowedFields });
    res.json({ message: 'Profile updated' });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Get My Stats ---
app.get('/api/profile/stats', auth, async (req, res) => {
  try {
    const total = await Complaints.countDocuments({ userId: req.user.userId });
    const pending = await Complaints.countDocuments({ userId: req.user.userId, status: 'Pending' });
    const inProgress = await Complaints.countDocuments({
      userId: req.user.userId,
      status: 'In Progress',
    });
    const resolved = await Complaints.countDocuments({ userId: req.user.userId, status: 'Resolved' });
    res.json({ total, pending, inProgress, resolved });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// --- Complaints: Create ---
app.post(
  '/api/complaints',
  auth,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'pdfDocument', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { subject, description, category, location, priority, isAnonymous } = req.body;

      if (!subject || !description || !category || !location) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
      }

      const userId = req.user.userId;
      const user = await Users.findOne({ _id: toObjectId(userId) });
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      console.log('📤 Uploading files to Cloudinary...');
      console.log('📁 Request files:', req.files ? Object.keys(req.files) : 'none');

      // Upload images
      const imageUrls = [];
      if (req.files && req.files['images']) {
        for (const file of req.files['images']) {
          try {
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'campus-complaints/images',
              resource_type: 'image',
              transformation: [{ width: 1200, quality: 'auto', crop: 'limit' }],
            });
            imageUrls.push(result.secure_url);
          } catch (imgError) {
            console.error('❌ Image upload failed:', imgError.message);
          }
        }
      }

      // Upload PDF
      let pdfUrl = null;
      let pdfPublicId = null;
      if (req.files && req.files['pdfDocument'] && req.files['pdfDocument'][0]) {
        console.log('📄 PDF file found:', req.files['pdfDocument'][0].originalname);
        console.log('📄 PDF size:', req.files['pdfDocument'][0].size, 'bytes');

        try {
          const result = await uploadToCloudinary(req.files['pdfDocument'][0].buffer, {
            folder: 'campus-complaints/documents',
            resource_type: 'raw',
            format: 'pdf',
            type: 'upload',
            access_mode: 'public',
          });
          pdfUrl = result.secure_url;
          pdfPublicId = result.public_id;
          console.log('✅ PDF uploaded successfully:', pdfUrl);
          console.log('📎 PDF Public ID:', pdfPublicId);
        } catch (pdfError) {
          console.error('❌ PDF upload failed:', pdfError.message);
          pdfUrl = null;
        }
      }

      console.log('✅ Files uploaded successfully');
      console.log('🖼️ Images:', imageUrls);
      console.log('📄 PDF:', pdfUrl);

      // Generate complaint ID
      const complaintCount = await Complaints.countDocuments();
      const complaintId = 'CMP' + String(complaintCount + 1).padStart(5, '0');

      const now = new Date();
      const complaint = {
        complaintId,
        userId,
        submittedBy: user.name,
        email: user.email,
        subject,  // ✅ Backend stores as
        title: subject, // ✅ Add title field for frontend
        description,
        category,
        location,
        priority: priority || 'Medium',
        images: imageUrls,
        pdfDocument: pdfUrl,
        pdfPublicId: pdfPublicId,
        status: 'Pending',
        assignedTo: null,
        adminRemarks: '',
        isAnonymous: isAnonymous === 'true' || isAnonymous === true ? true : false,
        submittedAt: now,
        createdAt: now, // ✅ Add createdAt for frontend
        updatedAt: now,
        resolvedAt: null,
        readByAdmin: false,
        readAt: null,
        timeline: [
          {
            status: 'Pending',
            timestamp: now,
            message: 'Complaint submitted',
          },
        ],
      };

      const r = await Complaints.insertOne(complaint);
      console.log('✅ Complaint saved to database:', r.insertedId);

      res.status(201).json({
        id: r.insertedId,
        complaintId: complaint.complaintId,
        message: 'Complaint submitted successfully',
        complaint: { ...complaint, _id: r.insertedId },
      });
    } catch (e) {
      console.error('❌ Error submitting complaint:', e);
      res.status(500).json({ message: 'Internal server error', error: e.message });
    }
  }
);

// Get all personal complaints
app.get('/api/complaints/mine', auth, async (req, res) => {
  try {
    const complaints = await Complaints.find({ userId: req.user.userId })
      .sort({ submittedAt: -1 })
      .toArray();

    // ✅ Transform for frontend
    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    res.json(transformed);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single complaint
app.get('/api/complaints/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    const complaint = await Complaints.findOne({ _id: toObjectId(id) });
    if (!complaint) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (req.user.role !== 'admin' && String(complaint.userId) !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // ✅ Transform for frontend
    const transformed = {
      ...complaint,
      title: complaint.title || complaint.subject,
      createdAt: complaint.createdAt || complaint.submittedAt,
    };

    res.json(transformed);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update complaint
app.put(
  '/api/complaints/:id',
  auth,
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'pdfDocument', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const complaint = await Complaints.findOne({ _id: toObjectId(id) });
      if (!complaint) {
        return res.status(404).json({ message: 'Not found' });
      }

      // Only owner can edit if pending and not assigned
      if (req.user.role !== 'admin') {
        if (String(complaint.userId) !== req.user.userId) {
          return res.status(403).json({ message: 'Not allowed to edit' });
        }
        if (complaint.status !== 'Pending') {
          return res.status(403).json({ message: 'Cannot edit non-pending complaint' });
        }
        if (complaint.assignedTo) {
          return res.status(403).json({ message: 'Cannot edit assigned complaint' });
        }
      }

      const { subject, description, category, priority, location, isAnonymous, existingImages, existingPdf } =
        req.body;

      const updateFields = {
        updatedAt: new Date(),
      };

      // Update text fields
      if (subject) {
        updateFields.subject = subject;
        updateFields.title = subject; // ✅ Keep title in sync
      }
      if (description) updateFields.description = description;
      if (category) updateFields.category = category;
      if (priority) updateFields.priority = priority;
      if (location) updateFields.location = location;
      if (typeof isAnonymous !== 'undefined') {
        updateFields.isAnonymous = isAnonymous === 'true' || isAnonymous === true;
      }

      // Handle images
      let finalImages = [];

      if (existingImages) {
        if (Array.isArray(existingImages)) {
          finalImages = [...existingImages];
        } else if (typeof existingImages === 'string') {
          try {
            finalImages = JSON.parse(existingImages);
          } catch {
            finalImages = [existingImages];
          }
        }
      }

      // Upload new images
      if (req.files && req.files['images']) {
        for (const file of req.files['images']) {
          try {
            const result = await uploadToCloudinary(file.buffer, {
              folder: 'campus-complaints/images',
              resource_type: 'image',
              transformation: [{ width: 1200, quality: 'auto', crop: 'limit' }],
            });
            finalImages.push(result.secure_url);
          } catch (imgError) {
            console.error('❌ Image upload failed:', imgError.message);
          }
        }
      }
      updateFields.images = finalImages;

      // Handle PDF
      if (existingPdf && existingPdf !== 'null' && existingPdf !== '') {
        updateFields.pdfDocument = existingPdf;
      } else if (req.files && req.files['pdfDocument'] && req.files['pdfDocument'][0]) {
        try {
          const result = await uploadToCloudinary(req.files['pdfDocument'][0].buffer, {
            folder: 'campus-complaints/documents',
            resource_type: 'raw',
            format: 'pdf',
            type: 'upload',
            access_mode: 'public',
          });
          updateFields.pdfDocument = result.secure_url;
          updateFields.pdfPublicId = result.public_id;
          console.log('✅ PDF updated:', result.secure_url);
        } catch (pdfError) {
          console.error('❌ PDF upload failed:', pdfError.message);
        }
      } else if (!existingPdf || existingPdf === 'null' || existingPdf === '') {
        updateFields.pdfDocument = null;
        updateFields.pdfPublicId = null;
      }

      const update = await Complaints.updateOne({ _id: toObjectId(id) }, { $set: updateFields });

      if (!update.matchedCount) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      // Fetch updated complaint
      const updatedComplaint = await Complaints.findOne({ _id: toObjectId(id) });

      // ✅ Transform for frontend
      const transformed = {
        ...updatedComplaint,
        title: updatedComplaint.title || updatedComplaint.subject,
        createdAt: updatedComplaint.createdAt || updatedComplaint.submittedAt,
      };

      res.json({
        message: 'Complaint updated successfully',
        complaint: transformed,
      });
    } catch (e) {
      console.error('❌ Update error:', e);
      res.status(500).json({ message: 'Internal server error', error: e.message });
    }
  }
);

// ✅ Get all complaints (Admin + fallback for students)
app.get('/api/complaints', auth, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's own complaints
    if (req.user.role !== 'admin') {
      query.userId = req.user.userId;
    }

    const complaints = await Complaints.find(query).sort({ submittedAt: -1 }).toArray();

    // ✅ Transform: Add title & createdAt for frontend
    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    console.log(`✅ Returning ${transformed.length} complaints for role: ${req.user.role}`);
    res.json(transformed);
  } catch (err) {
    console.error('❌ Error fetching complaints:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Admin Routes ---

// Update complaint status
app.put('/api/admin/complaints/:id/status', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks, assignedTo } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const updateFields = { updatedAt: new Date() };
    if (status) {
      updateFields.status = status;
      // Add to timeline
      const timelineEntry = {
        status,
        timestamp: new Date(),
        message: `Status changed to ${status}`,
      };
      await Complaints.updateOne({ _id: toObjectId(id) }, { $push: { timeline: timelineEntry } });
    }
    if (adminRemarks) updateFields.adminRemarks = adminRemarks;
    if (assignedTo) updateFields.assignedTo = assignedTo;
    if (status === 'Resolved') updateFields.resolvedAt = new Date();

    const result = await Complaints.updateOne({ _id: toObjectId(id) }, { $set: updateFields });

    if (!result.matchedCount) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Log admin action
    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: 'UPDATE_COMPLAINT_STATUS',
      complaintId: id,
      details: { status, adminRemarks, assignedTo },
      timestamp: new Date(),
    });

    res.json({ message: 'Complaint status updated' });
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign complaint
app.put('/api/admin/complaints/:id/assign', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    await Complaints.updateOne(
      { _id: toObjectId(id) },
      {
        $set: {
          assignedTo,
          status: 'In Progress',
          updatedAt: new Date(),
        },
        $push: {
          timeline: {
            status: 'In Progress',
            timestamp: new Date(),
            message: `Assigned to ${assignedTo}`,
          },
        },
      }
    );

    res.json({ message: 'Complaint assigned successfully' });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/complaints/admin/analytics', auth, requireRole('admin'), async (req, res) => {
  try {
    console.log("📊 Analytics request received");
    
    // Basic stats
    const total = await Complaints.countDocuments();
    const pending = await Complaints.countDocuments({ status: 'Pending' });
    const inProgress = await Complaints.countDocuments({ status: 'In Progress' });
    const resolved = await Complaints.countDocuments({ status: 'Resolved' });
    const rejected = await Complaints.countDocuments({ status: 'Rejected' });

    // Categories
    const categories = await Complaints.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();

    // Priorities
    const priorities = await Complaints.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]).toArray();

    // ✅ FIXED: Average Resolution Time - ROBUST CALCULATION
    const resolvedComplaints = await Complaints.find({ 
      status: 'Resolved', 
      resolvedAt: { $exists: true, $ne: null },
      submittedAt: { $exists: true, $ne: null }
    }).toArray();
    
    let avgResolutionTime = 0;
    
    if (resolvedComplaints.length > 0) {
      const validComplaints = resolvedComplaints.filter(complaint => {
        const submitted = new Date(complaint.submittedAt);
        const resolved = new Date(complaint.resolvedAt);
        return submitted.getTime() > 0 && resolved.getTime() > 0 && resolved > submitted;
      });
      
      if (validComplaints.length > 0) {
        const totalTimeMs = validComplaints.reduce((sum, complaint) => {
          const start = new Date(complaint.submittedAt);
          const end = new Date(complaint.resolvedAt);
          const diffMs = Math.max(0, end.getTime() - start.getTime()); // Ensure non-negative
          console.log(`⏱️ Complaint ${complaint.complaintId}: ${Math.round(diffMs/(1000*60*60), 1)} hrs`);
          return sum + diffMs;
        }, 0);
        
        avgResolutionTime = (totalTimeMs / validComplaints.length / (1000 * 60 * 60)).toFixed(1);
        console.log(`✅ AVG RESOLUTION: ${avgResolutionTime} hrs (${validComplaints.length}/${resolvedComplaints.length} valid)`);
      } else {
        console.log("⚠️ No valid timestamp pairs found in resolved complaints");
      }
    }

    const response = {
      stats: { 
        total, 
        pending, 
        inProgress, 
        resolved, 
        rejected 
      },
      avgResolutionTime: parseFloat(avgResolutionTime) || 0,
      categories,
      priorities,
      byPriority: {
        High: priorities.find(p => p._id === 'High')?.count || 0,
        Medium: priorities.find(p => p._id === 'Medium')?.count || 0,
        Low: priorities.find(p => p._id === 'Low')?.count || 0,
      }
    };

    console.log("📊 Analytics response:", {
      total,
      avgResolutionTime,
      categories: categories.length,
      resolvedComplaints: resolvedComplaints.length
    });

    res.json(response);
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ message: 'Analytics fetch failed' });
  }
});



// Get admin dashboard stats
app.get('/api/admin/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const total = await Complaints.countDocuments();
    const pending = await Complaints.countDocuments({ status: 'Pending' });
    const inProgress = await Complaints.countDocuments({ status: 'In Progress' });
    const resolved = await Complaints.countDocuments({ status: 'Resolved' });
    const rejected = await Complaints.countDocuments({ status: 'Rejected' });

    // Category-wise breakdown
    const categories = await Complaints.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]).toArray();

    // Priority-wise breakdown
    const priorities = await Complaints.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]).toArray();

    res.json({ total, pending, inProgress, resolved, rejected, categories, priorities });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all admins
app.get('/api/admin/users/admins', auth, requireRole('admin'), async (req, res) => {
  try {
    const admins = await Users.find({ role: 'admin' }, { projection: { password: 0 } }).toArray();
    res.json(admins);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅  Current Admin's Logs
app.get('/api/admin/logs', auth, requireRole('admin'), async (req, res) => {
  try {
    console.log('📋 Fetching logs for admin:', req.user.userId);
    
    const logs = await AdminLogs.find({ adminId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();
    
    console.log(`📋 Returning ${logs.length} personal logs for ${req.user.email}`);
    res.json(logs);
  } catch (error) {
    console.error('❌ Error fetching admin logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Delete complaint (soft delete)
app.delete('/api/admin/complaints/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    const result = await Complaints.updateOne(
      { _id: toObjectId(id) },
      {
        $set: {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: req.user.userId,
        },
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Log deletion
    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: 'DELETE_COMPLAINT',
      complaintId: id,
      timestamp: new Date(),
    });

    res.json({ message: 'Complaint deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark complaint as read
// ✅ BACKEND FIX: Change PUT → PATCH
app.patch('/api/complaints/admin/:id/read', auth, requireRole('admin'), async (req, res) => {  // ✅ PATCH + CORRECT ROUTE
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid complaint ID' });
    }

    const result = await Complaints.updateOne(
      { _id: toObjectId(id) },
      { 
        $set: { 
          readByAdmin: true, 
          readAt: new Date() 
        } 
      }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // ✅ Log admin action
    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: 'MARK_COMPLAINT_READ',
      complaintId: id,
      timestamp: new Date(),
    });

    console.log(`✅ Complaint ${id} marked as read by ${req.user.email}`); // DEBUG
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});// Get complaints by status
app.get('/api/complaints/status/:status', auth, async (req, res) => {
  try {
    const { status } = req.params;
    const query = req.user.role === 'admin' ? { status } : { userId: req.user.userId, status };

    const complaints = await Complaints.find(query).sort({ submittedAt: -1 }).toArray();

    // ✅ Transform for frontend
    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    res.json(transformed);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Search complaints
app.get('/api/complaints/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const searchQuery = { $text: { $search: q } };

    // Add user filter if not admin
    if (req.user.role !== 'admin') {
      searchQuery.userId = req.user.userId;
    }

    const complaints = await Complaints.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .toArray();

    // ✅ Transform for frontend
    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    res.json(transformed);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Department Management (Admin)
app.post('/api/admin/departments', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Department name required' });
    }

    const dept = {
      name,
      description: description || '',
      createdAt: new Date(),
      createdBy: req.user.userId,
    };

    const result = await Departments.insertOne(dept);
    res.status(201).json({ ...dept, _id: result.insertedId });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Department already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all departments
app.get('/api/departments', auth, async (req, res) => {
  try {
    const departments = await Departments.find().toArray();
    res.json(departments);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get complaint statistics by date range
app.get('/api/admin/stats/daterange', auth, requireRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery = {};

    if (startDate && endDate) {
      matchQuery.submittedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const stats = await Complaints.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]).toArray();

    res.json(stats);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Bulk update complaints
app.put('/api/admin/complaints/bulk-update', auth, requireRole('admin'), async (req, res) => {
  try {
    const { complaintIds, status, adminRemarks } = req.body;

    if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(400).json({ message: 'Complaint IDs required' });
    }

    const objectIds = complaintIds.map((id) => toObjectId(id)).filter((id) => id !== null);

    const updateFields = {
      status,
      updatedAt: new Date(),
    };

    if (adminRemarks) updateFields.adminRemarks = adminRemarks;
    if (status === 'Resolved') updateFields.resolvedAt = new Date();

    const result = await Complaints.updateMany({ _id: { $in: objectIds } }, { $set: updateFields });

    res.json({
      message: `${result.modifiedCount} complaints updated`,
      modifiedCount: result.modifiedCount,
    });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Cloudinary files list
app.get('/api/admin/cloudinary/files', auth, requireRole('admin'), async (req, res) => {
  try {
    const { folder } = req.query;

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder || 'campus-complaints',
      resource_type: 'raw',
      max_results: 50,
    });

    res.json({
      total: result.resources.length,
      files: result.resources.map((f) => ({
        public_id: f.public_id,
        url: f.secure_url,
        created_at: f.created_at,
        bytes: f.bytes,
        format: f.format,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Cloudinary file
app.delete('/api/admin/cloudinary/file', auth, requireRole('admin'), async (req, res) => {
  try {
    const { publicId, resourceType } = req.body;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID required' });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'raw',
    });

    res.json({ message: 'File deleted', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 404 handler (keep last)
app.use((req, res) => {
  res.status(404).json({ message: 'URL not found' });
});

// Error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 6 files.' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }

  next();
});
