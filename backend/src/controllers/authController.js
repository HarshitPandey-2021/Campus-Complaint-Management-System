// Auth logic

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { normalizeRole } = require("../utils/normalizeRole");
const { ObjectId } = require("mongodb");
const { toObjectId } = require("../utils/toObjectId");

const oneTimeCodes = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [code, data] of oneTimeCodes.entries()) {
    if (now - data.createdAt > 2 * 60 * 1000) {
      oneTimeCodes.delete(code);
    }
  }
}, 60 * 1000);

function getCollections(req) {
  return req.app.locals.collections;
}

// Register
async function register(req, res) {
  try {
    const { name, email, password, role, roll } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedRole = normalizeRole(role);
    if (normalizedRole === "student" && !roll) {
      return res
        .status(400)
        .json({ message: "Roll number required for students" });
    }

    const { Users } = getCollections(req);
    const existing = await Users.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date();

    const newUser = {
      name,
      email,
      password: hash,
      role: normalizedRole,
      ...(normalizedRole === "student" && { roll }),
      createdAt: now,
      updatedAt: now,
    };

    const r = await Users.insertOne(newUser);
    const userId = r.insertedId.toString();

    const payload = { userId, email, role: normalizedRole };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: {
        id: userId,
        _id: userId,
        name,
        email,
        role: normalizedRole,
        ...(normalizedRole === "student" && { roll }),
      },
    });
  } catch (e) {
    console.error("Register error:", e);
    const code = e.code === 11000 ? 409 : 500;
    res.status(code).json({ message: e.message || "Internal server error" });
  }
}

// Login
async function login(req, res) {
  const { email, password, role: requestedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const { Users } = getCollections(req);
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPwdValid = await bcrypt.compare(password, user.password);
    if (!isPwdValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const normalizedUserRole = normalizeRole(user.role);
    const normalizedRequestedRole = requestedRole
      ? normalizeRole(requestedRole)
      : null;

    if (
      normalizedRequestedRole &&
      normalizedRequestedRole !== normalizedUserRole
    ) {
      return res.status(403).json({
        message: `Access denied! Account (${email}) is "${normalizedUserRole}", not "${normalizedRequestedRole}". Use correct role.`,
      });
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: normalizedUserRole,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    const { password: _, ...safeUser } = user;

    res.status(200).json({
      user: {
        ...safeUser,
        role: normalizedUserRole,
        id: user._id.toString(),
        _id: user._id.toString(),
      },
      token: accessToken,
      refreshToken: refreshToken || accessToken,
      role: normalizedUserRole,
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Refresh token
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token type" });
    }

    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const { Users, AdminLogs } = getCollections(req);
    const user = await Users.findOne({
      _id: toObjectId(ObjectId, req.user.userId),
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await Users.updateOne(
      { _id: toObjectId(ObjectId, req.user.userId) },
      { $set: { password: hash, updatedAt: new Date() } },
    );

    if (req.user.role === "admin") {
      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "CHANGE_PASSWORD",
        timestamp: new Date(),
      });
    }

    return res.json({ message: "Password changed successfully" });
  } catch (e) {
    console.error("Change password error:", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Admin session code
async function createAdminSessionCode(req, res) {
  try {
    const { token, refreshToken, user } = req.body;
    if (!token || !user || user.role !== "admin") {
      return res.status(400).json({ message: "Invalid admin session data" });
    }

    const code = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    oneTimeCodes.set(code, {
      token,
      refreshToken: refreshToken || null,
      user,
      createdAt: Date.now(),
    });

    console.log("? One-time code generated for admin:", user.email);
    res.json({ code });
  } catch (error) {
    console.error("Session code generation error:", error);
    res.status(500).json({ message: "Failed to generate session code" });
  }
}

async function exchangeAdminCode(req, res) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Code required" });
    }

    const sessionData = oneTimeCodes.get(code);
    if (!sessionData) {
      return res.status(401).json({ message: "Invalid or expired code" });
    }

    const age = Date.now() - sessionData.createdAt;
    if (age > 2 * 60 * 1000) {
      oneTimeCodes.delete(code);
      return res.status(401).json({ message: "Code expired" });
    }

    oneTimeCodes.delete(code);
    console.log("? Code exchanged for admin:", sessionData.user.email);

    res.json({
      token: sessionData.token,
      refreshToken: sessionData.refreshToken,
      user: sessionData.user,
    });
  } catch (error) {
    console.error("Code exchange error:", error);
    res.status(500).json({ message: "Failed to exchange code" });
  }
}

module.exports = {
  register,
  login,
  refresh,
  changePassword,
  createAdminSessionCode,
  exchangeAdminCode,
};
