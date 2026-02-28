const { MongoClient } = require("mongodb");

// DB connection
async function initializeDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri || !dbName) {
    throw new Error("MONGODB_URI or DB_NAME missing");
  }

  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
  const Users = db.collection("Users");
  const Complaints = db.collection("Complaints");
  const AdminLogs = db.collection("AdminLogs");
  const Departments = db.collection("Departments");
  const PasswordResets = db.collection("PasswordResets");

  // DB indexes
  await Users.createIndex({ email: 1 }, { unique: true });
  await Departments.createIndex({ name: 1 }, { unique: true });
  await Complaints.createIndex({ userId: 1 });
  await Complaints.createIndex({ status: 1, priority: 1 });
  await Complaints.createIndex({ assignedTo: 1 });
  await Complaints.createIndex({ submittedAt: -1 });
  await Complaints.createIndex({ subject: "text", description: "text" });

  // Password reset indexes (auto-expire after 1 hour)
  await PasswordResets.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 60 }
  );
  await PasswordResets.createIndex({ userId: 1 });

  console.log("? MongoDB connected. DB:", dbName);

  return {
    db,
    client,
    collections: { Users, Complaints, AdminLogs, Departments, PasswordResets },
  };
}

module.exports = {
  initializeDb,
};
