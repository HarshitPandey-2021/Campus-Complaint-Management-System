// src/controllers/usersController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getUsersCollection } = require("../models/usersModel");

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register student/admin
async function createUser(req, res) {
  try {
    const db = req.app.locals.db;
    const Users = getUsersCollection(db);

    const { name, email, role, password, roll } = req.body;

    // Required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Allowed roles
    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Roll required for student
    if (role === "student" && !roll) {
      return res
        .status(400)
        .json({ message: "Roll number required for students" });
    }

    // Password strength
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars and include a number and uppercase letter",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Email unique
    const existingUser = await Users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Roll unique (for any role that has roll)
    if (roll) {
      const normalizedRoll = String(roll).trim();
      const existingRoll = await Users.findOne({ roll: normalizedRoll });
      if (existingRoll) {
        return res
          .status(400)
          .json({ message: "This roll number is already registered" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // New user doc
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      role,
      ...(roll && { roll: String(roll).trim() }),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert user
    const result = await Users.insertOne(newUser);

    // Create token
    const token = jwt.sign(
      {
        userId: result.insertedId.toString(),
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    // Response without password
    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        ...(newUser.roll && { roll: newUser.roll }),
      },
      token,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Login student/admin
async function loginUser(req, res) {
  const { email, password, role: requestedRole } = req.body;

  // Required fields
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const db = req.app.locals.db;
    const Users = getUsersCollection(db);

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await Users.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Optional role check
    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({
        message: `Access denied. This account is ${user.role}, not ${requestedRole}.`,
      });
    }

    // Create token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    // Strip password
    const { password: _, ...safeUser } = user;

    res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createUser,
  loginUser,
};
