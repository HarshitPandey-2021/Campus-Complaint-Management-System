// src/models/adminLogsModel.js

const ADMIN_LOGS_COLLECTION = "AdminLogs";

// Get AdminLogs collection
function getAdminLogsCollection(db) {
  return db.collection(ADMIN_LOGS_COLLECTION);
}

// Create indexes for AdminLogs
async function ensureAdminLogsIndexes(db) {
  const logs = getAdminLogsCollection(db);

  // Index by adminId for fast filtering
  await logs.createIndex({ adminId: 1 });

  // Index by timestamp (newest first queries)
  await logs.createIndex({ timestamp: -1 });
}

module.exports = {
  ADMIN_LOGS_COLLECTION,
  getAdminLogsCollection,
  ensureAdminLogsIndexes,
};
