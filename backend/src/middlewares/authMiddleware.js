// backend/src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Verify JWT token and attach user to request
function auth(req, res, next) {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    console.log("🔍 Auth middleware: checking token...");
    
    if (!authHeader) {
      console.warn("❌ No Authorization header");
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.warn("❌ Invalid Authorization format");
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    // Extract token
    const token = authHeader.substring(7);
    
    if (!token) {
      console.warn("❌ Empty token");
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    console.log("✅ Auth passed:", req.user.email, req.user.role);
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.name, error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Require specific role
function requireRole(role) {
  return (req, res, next) => {
    console.log("🔒 Role check: required", role, "actual", req.user?.role);
    
    if (!req.user) {
      console.warn("❌ req.user not set");
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.role !== role) {
      console.warn("❌ Role mismatch");
      return res.status(403).json({ message: `Forbidden: ${role}s only` });
    }
    
    console.log("✅ Role check passed");
    next();
  };
}

module.exports = { auth, requireRole };
