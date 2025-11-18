// src/models/complaintsModel.js

class Complaint {
  constructor({
    userId,
    subject,
    description,
    category,
    location,
    priority,
    imageUrl,
    status,
    assignedTo,
    adminRemarks,
    submittedAt,
    updatedAt,
    resolvedAt,
    readByAdmin,
    readAt
  }) {
    this.userId = userId;
    this.subject = subject;
    this.description = description;
    this.category = category;
    this.location = location;
    this.priority = priority;
    this.imageUrl = imageUrl || '';
    this.status = status || 'pending';
    this.assignedTo = assignedTo || '';
    this.adminRemarks = adminRemarks || '';

    this.submittedAt = submittedAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.resolvedAt = resolvedAt || null;

    // 🆕 NEW FIELDS for notification tracking
    this.readByAdmin = readByAdmin || false; // Whether admin has opened/read this complaint
    this.readAt = readAt || null;            // Timestamp of when it was read
  }

  static fromDb(document) {
    return new Complaint({
      userId: document.userId,
      subject: document.subject,
      description: document.description,
      category: document.category,
      location: document.location,
      priority: document.priority,
      imageUrl: document.imageUrl,
      status: document.status,
      assignedTo: document.assignedTo,
      adminRemarks: document.adminRemarks,
      submittedAt: document.submittedAt,
      updatedAt: document.updatedAt,
      resolvedAt: document.resolvedAt,
      readByAdmin: document.readByAdmin,
      readAt: document.readAt
    });
  }
}

module.exports = Complaint;
