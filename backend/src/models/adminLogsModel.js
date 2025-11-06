// Assuming you're using a simple class to represent the AdminLog model
class AdminLog {
  constructor(id, complaintId, adminId, action, remarks, timestamp) {
    this._id = id;
    this.complaintId = complaintId;
    this.adminId = adminId;
    this.action = action;
    this.remarks = remarks;
    this.timestamp = timestamp;
  }

  // Method to convert raw database document into an AdminLog instance
  static fromDb(doc) {
    return new AdminLog(
      doc._id,         // _id from MongoDB
      doc.complaintId,  // Complaint ID
      doc.adminId,      // Admin ID
      doc.action,       // Action taken by admin
      doc.remarks,      // Optional remarks
      doc.timestamp     // Timestamp of the action
    );
  }
}

module.exports = AdminLog;
