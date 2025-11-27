// src/controllers/complaintsController.js
const { ObjectId } = require('mongodb');
const cloudinary = require('../config/cloudinary');

// 🧑‍🎓 STUDENT: Create a new complaint with file uploads
async function createComplaint(req, res) {
  try {
    const db = req.app.locals.db;
    const {
      subject,
      description,
      category,
      location,
      priority,
      isAnonymous
    } = req.body;

    // ✅ Validate required fields
    if (!subject || !description || !category || !location) {
      return res.status(400).json({
        message: 'All required fields (subject, description, category, location) must be provided.'
      });
    }

    // ✅ Fetch logged-in user's details
    const user = await db.collection('Users').findOne({ _id: new ObjectId(req.user.userId) });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please re-login.' });
    }

    // ✅ Handle file uploads to Cloudinary
    let imageUrls = [];
    let pdfUrl = null;

    // Upload images
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              folder: 'campus-complaints/images',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    // Upload PDF
if (req.files && req.files.pdfDocument && req.files.pdfDocument[0]) {
  const pdfFile = req.files.pdfDocument[0];
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'campus-complaints/documents',
        resource_type: 'raw',
        format: 'pdf',
        flags: 'attachment',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(pdfFile.buffer);
  });
  pdfUrl = result.secure_url;
}


    // ✅ Generate complaint ID
    const complaintCount = await db.collection("Complaints").countDocuments();
    const complaintId = `CMP${String(complaintCount + 1).padStart(5, '0')}`;

    // ✅ Build complaint document
    const newComplaint = {
      complaintId,
      userId: req.user.userId,
      submittedBy: isAnonymous === 'true' ? 'Anonymous' : user.name,
      email: isAnonymous === 'true' ? null : user.email,
      subject,
      description,
      category,
      location,
      priority: priority || "Medium",
      images: imageUrls,
      pdfDocument: pdfUrl,
      status: "Pending",
      assignedTo: null,
      adminRemarks: "",
      isAnonymous: isAnonymous === 'true',
      submittedAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
      readByAdmin: false,
      readAt: null,
      createdAt: new Date()
    };

    const result = await db.collection("Complaints").insertOne(newComplaint);

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: { _id: result.insertedId, ...newComplaint },
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// 🧑‍🎓 STUDENT: Update complaint (only if pending and not assigned)
async function updateComplaint(req, res) {
  try {
    const db = req.app.locals.db;
    const complaintId = req.params.id;
    const userId = req.user.userId;

    if (!ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    // Find the complaint
    const complaint = await db.collection('Complaints').findOne({ 
      _id: new ObjectId(complaintId) 
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check if user owns the complaint
    if (complaint.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    // Check if complaint can be edited
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot edit complaint that is not pending' });
    }

    if (complaint.assignedTo) {
      return res.status(400).json({ message: 'Cannot edit assigned complaints' });
    }

    // Update basic fields
    const { subject, category, location, priority, description, isAnonymous, existingImages, existingPdf } = req.body;

    const updateFields = {
      updatedAt: new Date()
    };

    if (subject) updateFields.subject = subject;
    if (category) updateFields.category = category;
    if (location) updateFields.location = location;
    if (priority) updateFields.priority = priority;
    if (description) updateFields.description = description;
    if (typeof isAnonymous !== 'undefined') {
      updateFields.isAnonymous = isAnonymous === 'true';
    }

    // Handle existing images
    let finalImages = [];
    if (existingImages) {
      if (Array.isArray(existingImages)) {
        finalImages = existingImages;
      } else {
        finalImages = [existingImages];
      }
    }

    // Upload new images if provided
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { 
              folder: 'campus-complaints/images',
              resource_type: 'image'
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        finalImages.push(result.secure_url);
      }
    }

    updateFields.images = finalImages;

    // Handle PDF
    if (existingPdf) {
      updateFields.pdfDocument = existingPdf;
    } else if (req.files && req.files.pdfDocument && req.files.pdfDocument[0]) {
      const pdfFile = req.files.pdfDocument[0];
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: 'campus-complaints/documents',
            resource_type: 'raw'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(pdfFile.buffer);
      });
      updateFields.pdfDocument = result.secure_url;
    } else if (!existingPdf) {
      updateFields.pdfDocument = null;
    }

    // Update the complaint
    const result = await db.collection("Complaints").updateOne(
      { _id: new ObjectId(complaintId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Fetch updated complaint
    const updatedComplaint = await db.collection('Complaints').findOne({ 
      _id: new ObjectId(complaintId) 
    });

    res.status(200).json({
      message: 'Complaint updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// 🧑‍🎓 STUDENT: Get all complaints of logged-in user
async function getUserComplaints(req, res) {
  try {
    const db = req.app.locals.db;
    const complaints = await db
      .collection("Complaints")
      .find({ userId: req.user.userId })
      .sort({ submittedAt: -1 })
      .toArray();

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching user complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 🧑‍🎓 STUDENT: Get complaint by ID (only if belongs to student)
async function getComplaintById(req, res) {
  try {
    const db = req.app.locals.db;
    const complaintId = req.params.id;

    if (!ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    const complaint = await db.collection('Complaints').findOne({ 
      _id: new ObjectId(complaintId) 
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Regular users can only see their own complaint
    if (req.user.role !== "admin" && complaint.userId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(complaint);
  } catch (error) {
    console.error("Error fetching complaint by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 🧑‍💼 ADMIN: View all complaints
async function getAllComplaints(req, res) {
  try {
    const db = req.app.locals.db;

    const complaints = await db
      .collection("Complaints")
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();
      
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 🧑‍💼 ADMIN: Mark complaint as "read" (for notification panel)
async function markComplaintAsRead(req, res) {
  try {
    const db = req.app.locals.db;
    const complaintId = req.params.id;

    if (!ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    const result = await db.collection("Complaints").updateOne(
      { _id: new ObjectId(complaintId) },
      { $set: { readByAdmin: true, readAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint marked as read" });
  } catch (error) {
    console.error("Error marking complaint as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 🧑‍💼 ADMIN: Update complaint status / remarks / assigned staff
async function updateComplaintStatus(req, res) {
  try {
    const db = req.app.locals.db;
    const complaintId = req.params.id;
    const { status, adminRemarks, assignedTo } = req.body;

    if (!ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    if (!status && !adminRemarks && !assignedTo) {
      return res.status(400).json({
        message: "Provide at least one field to update (status, adminRemarks, or assignedTo).",
      });
    }

    const updateFields = { updatedAt: new Date() };

    if (status) {
      updateFields.status = status;
      if (status === "Resolved") updateFields.resolvedAt = new Date();
    }
    if (adminRemarks) updateFields.adminRemarks = adminRemarks;
    if (assignedTo) updateFields.assignedTo = assignedTo;

    const result = await db.collection("Complaints").updateOne(
      { _id: new ObjectId(complaintId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint updated successfully" });
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// 🧮 ADMIN: Get Complaint Analytics Data
async function getAnalyticsData(req, res) {
  try {
    const db = req.app.locals.db;
    const Complaints = db.collection("Complaints");

    // Counts by status
    const total = await Complaints.countDocuments();
    const resolved = await Complaints.countDocuments({ status: "Resolved" });
    const pending = await Complaints.countDocuments({ status: "Pending" });
    const inProgress = await Complaints.countDocuments({ status: "In Progress" });
    const rejected = await Complaints.countDocuments({ status: "Rejected" });

    // Counts by priority
    const high = await Complaints.countDocuments({ priority: "High" });
    const medium = await Complaints.countDocuments({ priority: "Medium" });
    const low = await Complaints.countDocuments({ priority: "Low" });

    // Optional: Average resolution time
    const resolvedComplaints = await Complaints.find({ status: "Resolved" }).toArray();
    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        if (c.submittedAt && c.resolvedAt) {
          sum += new Date(c.resolvedAt) - new Date(c.submittedAt);
        }
        return sum;
      }, 0);
      avgResolutionTime = (totalTime / resolvedComplaints.length / (1000 * 60 * 60)).toFixed(1);
    }

    res.status(200).json({
      stats: {
        total,
        resolved,
        pending,
        inProgress,
        rejected,
      },
      byPriority: {
        High: high,
        Medium: medium,
        Low: low,
      },
      avgResolutionTime,
    });
  } catch (error) {
    console.error("❌ Error fetching analytics data:", error);
    res.status(500).json({ message: "Failed to fetch analytics data", error });
  }
}

/*


/* =========================================================
   📦 EXPORTS
========================================================= */
module.exports = {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  getAnalyticsData,
  markComplaintAsRead,
};
