// src/controllers/complaintsController.js
const { ObjectId } = require("mongodb");
const cloudinary = require("../config/cloudinary");

// ==================== STUDENT ACTIONS ====================

// STUDENT: Create a new complaint with file uploads
async function createComplaint(req, res) {
  try {
    const db = req.app.locals.db;
    const { subject, description, category, location, priority, isAnonymous } = req.body;

    // Validate required fields
    if (!subject || !description || !category || !location) {
      return res.status(400).json({ 
        message: "All required fields (subject, description, category, location) must be provided." 
      });
    }

    // Fetch logged-in user's details
    const user = await db.collection("Users").findOne({ _id: new ObjectId(req.user.userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please re-login." });
    }

    // Handle file uploads to Cloudinary
    let imageUrls = [];
    let pdfUrl = null;
    let pdfPublicId = null;

    // Upload images
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        try {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "campus-complaints/images",
                resource_type: "image",
                transformation: { width: 1200, quality: "auto", crop: "limit" },
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(file.buffer);
          });

          imageUrls.push(result.secure_url);
        } catch (imgError) {
          console.error("Image upload failed:", imgError.message);
        }
      }
    }

    // Upload PDF
    if (req.files && req.files.pdfDocument && req.files.pdfDocument[0]) {
      const pdfFile = req.files.pdfDocument[0];
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "campus-complaints/documents",
              resource_type: "raw",
              format: "pdf",
              type: "upload",
              access_mode: "public",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(pdfFile.buffer);
        });

        pdfUrl = result.secure_url;
        pdfPublicId = result.public_id;
        console.log("✅ PDF uploaded:", pdfUrl);
      } catch (pdfError) {
        console.error("❌ PDF upload failed:", pdfError.message);
      }
    }

    // Generate complaint ID
    const complaintCount = await db.collection("Complaints").countDocuments();
    const complaintId = `CMP${String(complaintCount + 1).padStart(5, "0")}`;
    const now = new Date();

    // Build complaint document
    const newComplaint = {
      complaintId,
      userId: req.user.userId,
      submittedBy: isAnonymous === true ? "Anonymous" : user.name,
      email: isAnonymous === true ? null : user.email,
      subject,
      title: subject, // Backend field
      description,
      category,
      location,
      priority: priority || "Medium",
      images: imageUrls,
      pdfDocument: pdfUrl,
      pdfPublicId: pdfPublicId,
      status: "Pending",
      assignedTo: null,
      adminRemarks: "",
      isAnonymous: isAnonymous === true,
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

    const result = await db.collection("Complaints").insertOne(newComplaint);
    console.log("✅ Complaint created:", result.insertedId);

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: { _id: result.insertedId, ...newComplaint },
    });
  } catch (error) {
    console.error("❌ Error creating complaint:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

// STUDENT: Get all complaints of logged-in user
async function getUserComplaints(req, res) {
  try {
    const db = req.app.locals.db;
    const complaints = await db
      .collection("Complaints")
      .find({ userId: req.user.userId })
      .sort({ submittedAt: -1 })
      .toArray();

    // Transform for frontend
    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    res.status(200).json(transformed);
  } catch (error) {
    console.error("❌ Error fetching user complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ==================== SHARED ====================

// Get complaint by ID (Student or Admin)
async function getComplaintById(req, res) {
  try {
    const db = req.app.locals.db;
    const complaintId = req.params.id;

    if (!ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    const complaint = await db.collection("Complaints").findOne({
      _id: new ObjectId(complaintId),
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Regular users can only see their own complaint
    if (req.user.role !== "admin" && complaint.userId !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Transform for frontend
    const transformed = {
      ...complaint,
      title: complaint.title || complaint.subject,
      createdAt: complaint.createdAt || complaint.submittedAt,
    };

    res.status(200).json(transformed);
  } catch (error) {
    console.error("❌ Error fetching complaint by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ✅ UPDATED: Update complaint (Student OR Admin)
async function updateComplaint(req, res) {
  try {
    const db = req.app.locals.db;
    const complaintId = req.params.id;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    // Find the complaint
    const complaint = await db.collection("Complaints").findOne({
      _id: new ObjectId(complaintId),
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Authorization check
    if (userRole === "student") {
      // Students can only update their own complaints
      if (complaint.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this complaint" });
      }

      // Students can only edit pending/unassigned complaints
      if (complaint.status !== "Pending") {
        return res.status(400).json({ message: "Cannot edit complaint that is not pending" });
      }

      if (complaint.assignedTo) {
        return res.status(400).json({ message: "Cannot edit assigned complaints" });
      }
    }
    // Admins can update any complaint (no restrictions)

    // Update basic fields
    const { subject, category, location, priority, description, isAnonymous, existingImages, existingPdf } = req.body;

    const updateFields = { updatedAt: new Date() };

    if (subject) {
      updateFields.subject = subject;
      updateFields.title = subject; // Keep title in sync
    }

    if (category) updateFields.category = category;
    if (location) updateFields.location = location;
    if (priority) updateFields.priority = priority;
    if (description) updateFields.description = description;

    if (typeof isAnonymous !== "undefined") {
      updateFields.isAnonymous = isAnonymous === true;
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
        try {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "campus-complaints/images",
                resource_type: "image",
                transformation: { width: 1200, quality: "auto", crop: "limit" },
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(file.buffer);
          });

          finalImages.push(result.secure_url);
        } catch (imgError) {
          console.error("❌ Image upload failed:", imgError.message);
        }
      }
    }

    updateFields.images = finalImages;

    // Handle PDF
    if (existingPdf && existingPdf !== "null" && existingPdf !== "") {
      updateFields.pdfDocument = existingPdf;
    } else if (req.files && req.files.pdfDocument && req.files.pdfDocument[0]) {
      const pdfFile = req.files.pdfDocument[0];
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "campus-complaints/documents",
              resource_type: "raw",
              format: "pdf",
              type: "upload",
              access_mode: "public",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(pdfFile.buffer);
        });

        updateFields.pdfDocument = result.secure_url;
        updateFields.pdfPublicId = result.public_id;
        console.log("✅ PDF updated:", result.secure_url);
      } catch (pdfError) {
        console.error("❌ PDF upload failed:", pdfError.message);
      }
    } else if (!existingPdf || existingPdf === "null" || existingPdf === "") {
      updateFields.pdfDocument = null;
      updateFields.pdfPublicId = null;
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
    const updatedComplaint = await db.collection("Complaints").findOne({
      _id: new ObjectId(complaintId),
    });

    // Transform response
    const transformed = {
      ...updatedComplaint,
      title: updatedComplaint.title || updatedComplaint.subject,
      createdAt: updatedComplaint.createdAt || updatedComplaint.submittedAt,
    };

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint: transformed,
    });
  } catch (error) {
    console.error("❌ Update complaint error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// ==================== ADMIN ACTIONS ====================

// ADMIN: View all complaints
async function getAllComplaints(req, res) {
  try {
    const db = req.app.locals.db;
    const complaints = await db
      .collection("Complaints")
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();

    // Transform: Add title & createdAt for frontend
    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    console.log(`✅ Returning ${transformed.length} complaints to admin`);
    res.status(200).json(transformed);
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ADMIN: Mark complaint as read (for notification panel)
async function markComplaintAsRead(req, res) {
  try {
    const db = req.app.locals.db;
    const complaintId = req.params.id;

    if (!ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint ID format" });
    }

    const result = await db.collection("Complaints").updateOne(
      { _id: new ObjectId(complaintId) },
      {
        $set: {
          readByAdmin: true,
          readAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint marked as read" });
  } catch (error) {
    console.error("❌ Error marking complaint as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ADMIN: Update complaint status / remarks / assigned staff
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
        message: "Provide at least one field to update: status, adminRemarks, or assignedTo.",
      });
    }

    const updateFields = { updatedAt: new Date() };

    if (status) {
      updateFields.status = status;
      if (status === "Resolved") {
        updateFields.resolvedAt = new Date();
      }

      // Add to timeline
      await db.collection("Complaints").updateOne(
        { _id: new ObjectId(complaintId) },
        {
          $push: {
            timeline: {
              status,
              timestamp: new Date(),
              message: `Status changed to ${status}`,
              updatedBy: req.user.userId,
            },
          },
        }
      );
    }

    if (adminRemarks) {
      updateFields.adminRemarks = adminRemarks;
    }

    if (assignedTo) {
      updateFields.assignedTo = assignedTo;
    }

    const result = await db.collection("Complaints").updateOne(
      { _id: new ObjectId(complaintId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Log admin action
    await db.collection("AdminLogs").insertOne({
      adminId: req.user.userId,
      action: "UPDATE_COMPLAINT_STATUS",
      complaintId: complaintId,
      details: { status, adminRemarks, assignedTo },
      timestamp: new Date(),
    });

    console.log(`✅ Complaint ${complaintId} updated to status: ${status}`);
    res.status(200).json({ message: "Complaint updated successfully", success: true });
  } catch (error) {
    console.error("❌ Error updating complaint:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ✅ FIXED: ADMIN - Get Complaint Analytics Data WITH CATEGORIES
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

    // ✅ Category-wise breakdown (MongoDB aggregation)
    const categories = await Complaints.aggregate([
      {
        $group: {
          _id: "$category", // Group by category field
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          _id: { $ne: null, $ne: "" }, // Exclude null/empty categories
        },
      },
      {
        $sort: { count: -1 }, // Sort by highest count first
      },
      {
        $limit: 10, // Top 10 categories
      },
    ]).toArray();

    console.log("✅ Categories aggregation result:", categories);

    // ✅ Priority-wise breakdown (MongoDB aggregation)
    const priorities = await Complaints.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          _id: { $ne: null, $ne: "" },
        },
      },
    ]).toArray();

    console.log("✅ Priorities aggregation result:", priorities);

    // ✅ Average Resolution Time (in hours)
    const resolvedComplaints = await Complaints.find({ 
      status: "Resolved",
      submittedAt: { $exists: true },
      resolvedAt: { $exists: true }
    }).toArray();

    let avgResolutionTime = 0;

    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        if (c.submittedAt && c.resolvedAt) {
          const timeDiff = new Date(c.resolvedAt) - new Date(c.submittedAt);
          sum += timeDiff;
        }
        return sum;
      }, 0);

      // Convert milliseconds to hours
      avgResolutionTime = (totalTime / resolvedComplaints.length / 1000 / 60 / 60).toFixed(1);
    }

    console.log("✅ Average resolution time:", avgResolutionTime, "hours");

    // ✅ Return structured response
    res.status(200).json({
      stats: {
        total,
        resolved,
        pending,
        inProgress,
        rejected,
      },
      byPriority: {
        HIGH: high,
        MEDIUM: medium,
        LOW: low,
      },
      categories, // ✅ Array: [{ _id: "Academic", count: 5 }, ...]
      priorities, // ✅ Array: [{ _id: "High", count: 3 }, ...]
      avgResolutionTime: parseFloat(avgResolutionTime), // Convert to number
    });
  } catch (error) {
    console.error("❌ Error fetching analytics data:", error);
    res.status(500).json({
      message: "Failed to fetch analytics data",
      error: error.message,
    });
  }
}


// At the BOTTOM of complaintsController.js, BEFORE module.exports

// ==================== PUBLIC STATS FOR LANDING PAGE ====================
async function getLandingStats(req, res) {
  try {
    const db = req.app.locals.db;
    const Complaints = db.collection("Complaints");

    // Total resolved complaints
    const totalResolved = await Complaints.countDocuments({ status: "Resolved" });

    // Calculate average response time (in hours)
    const resolvedComplaints = await Complaints.find({ 
      status: "Resolved",
      submittedAt: { $exists: true },
      resolvedAt: { $exists: true }
    }).toArray();

    let avgResponseHours = 24; // Default fallback

    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        if (c.submittedAt && c.resolvedAt) {
          const timeDiff = new Date(c.resolvedAt) - new Date(c.submittedAt);
          return sum + timeDiff;
        }
        return sum;
      }, 0);

      avgResponseHours = Math.round(totalTime / resolvedComplaints.length / 1000 / 60 / 60);
      if (avgResponseHours < 1) avgResponseHours = 1;
    }

    // Calculate satisfaction rate
    const totalComplaints = await Complaints.countDocuments();
    const satisfactionRate = totalComplaints > 0 
      ? Math.round((totalResolved / totalComplaints) * 100) 
      : 95;

    console.log("✅ Landing stats:", { totalResolved, avgResponseHours, satisfactionRate });

    res.status(200).json({
      totalResolved,
      avgResponseTime: `${avgResponseHours} Hrs`,
      satisfactionRate,
    });
  } catch (error) {
    console.error("❌ Error fetching landing stats:", error);
    res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
}


// ==================== ADMIN: GET UNREAD COMPLAINTS ====================

async function getUnreadComplaints(req, res) {
  try {
    const db = req.app.locals.db;
    
    const unreadComplaints = await db
      .collection("Complaints")
      .find({ readByAdmin: { $ne: true } })
      .sort({ submittedAt: -1 })
      .limit(50) // Limit for performance
      .toArray();

    // Transform for frontend
    const transformed = unreadComplaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    console.log(`✅ Found ${transformed.length} unread complaints`);
    res.status(200).json(transformed);
  } catch (error) {
    console.error("❌ Error fetching unread complaints:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ==================== EXPORTS ====================
module.exports = {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaint,
  updateComplaintStatus,
  getAnalyticsData,
  markComplaintAsRead,
  getLandingStats,  // ✅ MAKE SURE THIS IS HERE!
    getUnreadComplaints,  // ✅ ADD THIS!
};