const { MongoClient } = require("mongodb");

function normalizeMongoUri(raw) {
  let uri = String(raw || "").trim();
  if (!uri) return uri;

  // Render mistake: pasting "MONGODB_URI=mongodb+srv://..." as the value
  if (/^MONGODB_URI\s*=/i.test(uri)) {
    uri = uri.replace(/^MONGODB_URI\s*=\s*/i, "").trim();
  }
  uri = uri.replace(/^["']|["']$/g, "").trim();

  // mongodb+srv must not include :27017 (or any port) on the host
  if (uri.startsWith("mongodb+srv://")) {
    uri = uri.replace(/(@[^/?#]+):\d+(?=\/|$|\?|#)/, "$1");
  }

  return uri;
}

// DB connection
async function initializeDb() {
  const uri = normalizeMongoUri(process.env.MONGODB_URI);
  const dbName = process.env.DB_NAME;

  if (!uri || !dbName) {
    throw new Error("MONGODB_URI or DB_NAME missing");
  }

  if (!/^mongodb(\+srv)?:\/\//i.test(uri)) {
    throw new Error(
      'MONGODB_URI must start with "mongodb://" or "mongodb+srv://"'
    );
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
