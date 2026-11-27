// Complaint logic

const { ObjectId } = require("mongodb");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");
const { toObjectId } = require("../utils/toObjectId");
const {
  EMAIL_NOTIFY_STATUSES,
  notifyComplaintStatusChange,
} = require("../utils/emailService");

function getCollections(req) {
  return req.app.locals.collections;
}

// Create complaint
async function createComplaint(req, res) {
  try {
    const { subject, description, category, location, priority, isAnonymous } =
      req.body;

    if (!subject || !description || !category || !location) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const { Users, Complaints } = getCollections(req);
    const userId = req.user.userId;
    const user = await Users.findOne({ _id: toObjectId(ObjectId, userId) });
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

    if (req.files && req.files["pdfDocument"] && req.files["pdfDocument"][0]) {
      try {
        const result = await uploadToCloudinary(
          req.files["pdfDocument"][0].buffer,
          {
            folder: "campus-complaints/documents",
            resource_type: "raw",
            format: "pdf",
            type: "upload",
            access_mode: "public",
          },
        );

        pdfUrl = result.secure_url;
        pdfPublicId = result.public_id;
      } catch (pdfError) {
        console.error("PDF upload failed:", pdfError.message);
        pdfUrl = null;
      }
    }

    const complaintCount = await Complaints.countDocuments();
    const complaintId = `CMP${String(complaintCount + 1).padStart(5, "0")}`;

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

// Get my complaints
async function getUserComplaints(req, res) {
  try {
    const { Complaints } = getCollections(req);
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
}

// Get complaint by id
async function getComplaintById(req, res) {
  try {
    const { Complaints } = getCollections(req);
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const complaint = await Complaints.findOne({
      _id: toObjectId(ObjectId, id),
    });
    if (!complaint) {
      return res.status(404).json({ message: "Not found" });
    }

    if (
      req.user.role !== "admin" &&
      String(complaint.userId) !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    let effectiveComplaint = complaint;
    if (req.user.role === "admin" && !complaint.readByAdmin) {
      const now = new Date();
      await Complaints.updateOne(
        { _id: toObjectId(ObjectId, id) },
        { $set: { readByAdmin: true, readAt: now } },
      );
      effectiveComplaint = { ...complaint, readByAdmin: true, readAt: now };
    }

    const transformed = {
      ...effectiveComplaint,
      title: effectiveComplaint.title || effectiveComplaint.subject,
      createdAt: effectiveComplaint.createdAt || effectiveComplaint.submittedAt,
    };

    res.json(transformed);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update complaint
async function updateComplaint(req, res) {
  try {
    const { Complaints } = getCollections(req);
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const complaint = await Complaints.findOne({
      _id: toObjectId(ObjectId, id),
    });
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
      updateFields.isAnonymous = isAnonymous === "true" || isAnonymous === true;
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
          },
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
      { _id: toObjectId(ObjectId, id) },
      { $set: updateFields },
    );

    if (!update.matchedCount) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const updatedComplaint = await Complaints.findOne({
      _id: toObjectId(ObjectId, id),
    });

    const transformed = {
      ...updatedComplaint,
      title: updatedComplaint.title || updatedComplaint.subject,
      createdAt: updatedComplaint.createdAt || updatedComplaint.submittedAt,
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

// List complaints
async function listComplaints(req, res) {
  try {
    const { Complaints } = getCollections(req);
    const query = req.user.role === "admin" ? {} : { userId: req.user.userId };

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
}

// Admin list all
async function getAllComplaints(req, res) {
  try {
    const { Complaints } = getCollections(req);
    const complaints = await Complaints.find({})
      .sort({ submittedAt: -1 })
      .toArray();

    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    if (process.env.NODE_ENV !== "production") {
      console.log(`? Returning ${transformed.length} complaints to admin`);
    }
    res.json(transformed);
  } catch (err) {
    console.error("Error fetching all complaints:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Admin unread list
async function getUnreadComplaints(req, res) {
  try {
    const { Complaints } = getCollections(req);
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
    res.status(500).json({ message: "Failed to fetch unread complaints" });
  }
}

// Admin mark read
async function markComplaintRead(req, res) {
  try {
    const { Complaints, AdminLogs } = getCollections(req);
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const result = await Complaints.updateOne(
      { _id: toObjectId(ObjectId, id) },
      {
        $set: {
          readByAdmin: true,
          readAt: new Date(),
        },
      },
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

// Admin update status
async function updateComplaintStatus(req, res) {
  try {
    const { Complaints, AdminLogs } = getCollections(req);
    const { id } = req.params;
    const { status, adminRemarks, assignedTo } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingComplaint = await Complaints.findOne({
      _id: toObjectId(ObjectId, id),
    });

    if (!existingComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
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
        { _id: toObjectId(ObjectId, id) },
        { $push: { timeline: timelineEntry } },
      );
    }

    if (adminRemarks) updateFields.adminRemarks = adminRemarks;
    if (assignedTo) updateFields.assignedTo = assignedTo;
    if (status === "Resolved") updateFields.resolvedAt = new Date();

    const result = await Complaints.updateOne(
      { _id: toObjectId(ObjectId, id) },
      { $set: updateFields },
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

    const nextStatus = status || existingComplaint.status;
    const statusChanged = status && status !== existingComplaint.status;

    if (statusChanged && EMAIL_NOTIFY_STATUSES.includes(nextStatus)) {
      notifyComplaintStatusChange(
        { ...existingComplaint, ...updateFields, status: nextStatus },
        nextStatus,
      );
    }

    res.json({ message: "Complaint status updated" });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Admin assign
async function assignComplaint(req, res) {
  try {
    const { Complaints } = getCollections(req);
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingComplaint = await Complaints.findOne({
      _id: toObjectId(ObjectId, id),
    });

    if (!existingComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const now = new Date();
    const nextStatus = "In Progress";

    await Complaints.updateOne(
      { _id: toObjectId(ObjectId, id) },
      {
        $set: {
          assignedTo,
          status: nextStatus,
          updatedAt: now,
        },
        $push: {
          timeline: {
            status: nextStatus,
            timestamp: now,
            message: `Assigned to ${assignedTo}`,
          },
        },
      },
    );

    if (existingComplaint.status !== nextStatus) {
      notifyComplaintStatusChange(
        {
          ...existingComplaint,
          assignedTo,
          status: nextStatus,
          updatedAt: now,
          adminRemarks: existingComplaint.adminRemarks || `Assigned to ${assignedTo}`,
        },
        nextStatus,
      );
    }

    res.json({ message: "Complaint assigned successfully" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}

// Admin analytics
async function getAnalytics(req, res) {
  try {
    const { Complaints } = getCollections(req);
    const total = await Complaints.countDocuments();
    const pending = await Complaints.countDocuments({ status: "Pending" });
    const inProgress = await Complaints.countDocuments({
      status: "In Progress",
    });
    const resolved = await Complaints.countDocuments({ status: "Resolved" });
    const rejected = await Complaints.countDocuments({ status: "Rejected" });

    const categoryStats = await Complaints.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const priorityStats = await Complaints.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$priority", "UNKNOWN"] },
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const byPriority = {};
    priorityStats.forEach((p) => {
      const key = p._id || "UNKNOWN";
      byPriority[key] = p.count || 0;
    });

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
              1000 * 60 * 60,
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

    res.json({
      stats: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
      },
      categories: categoryStats,
      byCategory: null,
      categoryStats,
      byPriority,
      priorities: priorityStats,
      avgResolutionTime,
    });
  } catch (e) {
    console.error("Analytics error:", e);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
}

// Public stats
async function getPublicStats(req, res) {
  try {
    const { Complaints } = getCollections(req);
    const totalResolved = await Complaints.countDocuments({
      status: "Resolved",
    });

    const resolvedComplaints = await Complaints.find({
      status: "Resolved",
      submittedAt: { $exists: true },
      resolvedAt: { $exists: true },
    }).toArray();

    let avgResponseHours = 24;

    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        if (c.submittedAt && c.resolvedAt) {
          const timeDiff = new Date(c.resolvedAt) - new Date(c.submittedAt);
          return sum + timeDiff;
        }
        return sum;
      }, 0);

      avgResponseHours = Math.round(
        totalTime / resolvedComplaints.length / 1000 / 60 / 60,
      );
      if (avgResponseHours < 1) avgResponseHours = 1;
    }

    const totalComplaints = await Complaints.countDocuments();
    const satisfactionRate =
      totalComplaints > 0
        ? Math.round((totalResolved / totalComplaints) * 100)
        : 95;

    if (process.env.NODE_ENV !== "production") {
      console.log("? Landing stats:", {
        totalResolved,
        avgResponseHours,
        satisfactionRate,
      });
    }

    res.status(200).json({
      totalResolved: totalResolved || 50,
      avgResponseTime: `${avgResponseHours} Hrs`,
      satisfactionRate: satisfactionRate || 95,
    });
  } catch (error) {
    console.error("? Error fetching landing stats:", error);
    res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
}

module.exports = {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  updateComplaint,
  listComplaints,
  getAllComplaints,
  getUnreadComplaints,
  markComplaintRead,
  updateComplaintStatus,
  assignComplaint,
  getAnalytics,
  getPublicStats,
};
