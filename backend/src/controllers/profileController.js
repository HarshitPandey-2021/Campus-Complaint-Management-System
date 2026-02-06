// Profile logic

const { ObjectId } = require("mongodb");
const { toObjectId } = require("../utils/toObjectId");

function getCollections(req) {
  return req.app.locals.collections;
}

// Get profile
async function getProfile(req, res) {
  try {
    const { Users } = getCollections(req);
    const user = await Users.findOne(
      { _id: toObjectId(ObjectId, req.user.userId) },
      { projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  } catch (e) {
    console.error("Profile fetch error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update profile
async function updateProfile(req, res) {
  try {
    const { Users } = getCollections(req);
    const allowedFields = {};
    if ("name" in req.body) allowedFields.name = req.body.name;
    if ("phone" in req.body) allowedFields.phone = req.body.phone;
    allowedFields.updatedAt = new Date();

    await Users.updateOne(
      { _id: toObjectId(ObjectId, req.user.userId) },
      { $set: allowedFields }
    );

    res.json({ message: "Profile updated" });
  } catch (e) {
    console.error("Profile update error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Profile stats
async function getProfileStats(req, res) {
  try {
    const { Complaints } = getCollections(req);
    const total = await Complaints.countDocuments({
      userId: req.user.userId,
    });

    const pending = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "Pending",
    });

    const inProgress = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "In Progress",
    });

    const resolved = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "Resolved",
    });

    res.json({ total, pending, inProgress, resolved });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getProfileStats,
};

