// src/controllers/adminLogsController.js

// Controller: Get recent logs for current admin
async function getAdminLogs(req, res) {
  try {
    // Database connection from app.locals
    const db = req.app.locals.db;

    // Current admin id from JWT (set by auth middleware)
    const adminId = req.user.userId;

    // Fetch latest 50 logs for this admin, most recent first
    const logs = await db
      .collection("AdminLogs")
      .find({ adminId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    // Send logs to client
    res.status(200).json(logs);
  } catch (error) {
    console.error("Get admin logs error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Export controllers
module.exports = { getAdminLogs };
