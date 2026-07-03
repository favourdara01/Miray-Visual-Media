import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/BlacklistedToken.js";

// ========================================================
// 1. CORE PROTECTION GATEWAY (PROTECTS ALL SECURED ROUTES)
// ========================================================
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication credentials missing or malformed" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token missing from authorization header" });
    }

    // 🔐 BLACKLIST CHECK (Enforced universally for both Admins and Clients)
    const blacklisted = await BlacklistedToken.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Session revoked. Please re-authenticate." });
    }

    // Cryptographic token string check matching process environment secrets
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Populate the request user context object cleanly
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT VERIFICATION EXCEPTION:", err.message);
    return res.status(401).json({ message: "Invalid or expired session token token signature" });
  }
};

// ========================================================
// 2. ADMIN ONLY AUTHORIZATION GUARD
// ========================================================
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication context missing" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Administrative credentials required." });
  }

  next();
};

// ========================================================
// 3. CLIENT ONLY AUTHORIZATION GUARD
// ========================================================
export const clientOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication context missing" });
  }

  // Allow admins to optionally inspect client workspaces, but block cross-client snooping
  if (req.user.role !== "client" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Valid client partition required." });
  }

  next();
};