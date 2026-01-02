// src/config/db.js

const { MongoClient } = require("mongodb");
const { ensureUsersIndexes } = require("../models/usersModel");
const { ensureAdminLogsIndexes } = require("../models/adminLogsModel");

// Connect to MongoDB and init indexes
async function initializeDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri || !dbName) {
    throw new Error("MONGODB_URI or DB_NAME missing");
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
  console.log("✅ MongoDB connected:", dbName);

  // Ensure indexes
  await ensureUsersIndexes(db);
  await ensureAdminLogsIndexes(db);

  console.log("✅ Users/AdminLogs indexes ready");

  return { db, client };
}

module.exports = {
  initializeDB,
};
