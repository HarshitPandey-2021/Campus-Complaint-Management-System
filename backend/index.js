require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'CampusComplaints';
const PORT = process.env.PORT || 4000;

let db, Users, Complaints, AdminLogs, Departments;

function toObjectId(id) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

async function start() {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  Users = db.collection('Users');
  Complaints = db.collection('Complaints');
  AdminLogs = db.collection('AdminLogs');
  Departments = db.collection('Departments');

  // Recommended indexes (safe to run repeatedly)
  await Users.createIndex({ email: 1 }, { unique: true });
  await Departments.createIndex({ name: 1 }, { unique: true });
  await Complaints.createIndex({ userId: 1 });
  await Complaints.createIndex({ status: 1, priority: 1 });
  await Complaints.createIndex({ assignedTo: 1 });
  await Complaints.createIndex({ submittedAt: -1 });
  await Complaints.createIndex({ subject: 'text', description: 'text' });

  console.log(`Connected to MongoDB. DB: ${dbName}`);
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

app.get('/health', (_, res) => res.json({ ok: true }));

// Departments
app.post('/departments', async (req, res) => {
  try {
    const { name, contactEmail, currentLoad = 0 } = req.body;
    if (!name || !contactEmail) return res.status(400).json({ error: 'name and contactEmail are required' });
    const r = await Departments.insertOne({ name, contactEmail, currentLoad });
    res.json({ insertedId: r.insertedId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Users (password hashed)
app.post('/users', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password are required' });
    const hash = await bcrypt.hash(password, 10);
    const now = new Date();
    const r = await Users.insertOne({ name, email, password: hash, role, createdAt: now, updatedAt: now });
    res.json({ insertedId: r.insertedId });
  } catch (e) {
    const code = e.code === 11000 ? 409 : 500;
    res.status(code).json({ error: e.message });
  }
});

// Complaints
app.post('/complaints', async (req, res) => {
  try {
    const { userId, subject, description, category, location, priority = 'Medium', imageUrl, status = 'Pending' } = req.body;
    if (!userId || !subject || !description || !category || !location) {
      return res.status(400).json({ error: 'userId, subject, description, category, location are required' });
    }
    const uid = toObjectId(userId);
    if (!uid) return res.status(400).json({ error: 'Invalid userId' });

    const now = new Date();
    const doc = {
      userId: uid, subject, description, category, location, priority, imageUrl,
      status, submittedAt: now, updatedAt: now
    };
    const r = await Complaints.insertOne(doc);
    res.json({ insertedId: r.insertedId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Admin Logs
app.post('/adminlogs', async (req, res) => {
  try {
    const { complaintId, adminId, action, remarks } = req.body;
    if (!complaintId || !adminId || !action) return res.status(400).json({ error: 'complaintId, adminId, action are required' });

    const cid = toObjectId(complaintId);
    const aid = toObjectId(adminId);
    if (!cid || !aid) return res.status(400).json({ error: 'Invalid complaintId or adminId' });

    const r = await AdminLogs.insertOne({
      complaintId: cid,
      adminId: aid,
      action,
      remarks,
      timestamp: new Date()
    });
    res.json({ insertedId: r.insertedId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

start().catch((e) => {
  console.error('Failed to start server:', e);
  process.exit(1);
});
