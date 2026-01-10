// backend/src/controllers/usersController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Login user - generates access & refresh tokens
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate access token (7 days for development, 1h for production)
    const accessToken = jwt.sign(
      {
        userId: user._id.toString(), // ✅ FIXED: Use _id and convert to string
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Generate refresh token (30 days)
    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(), // ✅ FIXED: Use _id and convert to string
        email: user.email,
        role: user.role,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log("✅ User logged in:", email, "role:", user.role);

    // Return both tokens & user data
    res.json({
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        _id: user._id.toString(), // ✅ FIXED: Use _id
        name: user.name,
        email: user.email,
        role: user.role,
        roll: user.roll || null,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Refresh access token using refresh token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    // Ensure it's a refresh token (not access token)
    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token type" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Access token refreshed for:", decoded.email);
    res.json({ token: newAccessToken });
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, roll } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by User model pre-save hook
      role: role || "student",
      roll: roll || null,
    });

    await user.save();
    console.log("✅ User registered:", email);

    // Generate tokens for immediate login after registration
    const accessToken = jwt.sign(
      {
        userId: user._id.toString(), // ✅ FIXED: Use _id
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(), // ✅ FIXED: Use _id
        email: user.email,
        role: user.role,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        _id: user._id.toString(), // ✅ FIXED: Use _id
        name: user.name,
        email: user.email,
        role: user.role,
        roll: user.roll,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};
