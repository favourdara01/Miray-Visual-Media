import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/BlacklistedToken.js";
import Client from "../models/Client.js";

// ================= AUTH =================
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // 🔐 check blacklist
    const blacklisted = await BlacklistedToken.findOne({
      token,
    });

    if (blacklisted) {
      return res.status(401).json({ message: "Token revoked" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// ================= ADMIN =================
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  next();
};



export const protectClient = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token",
      });
    }

    const token = auth.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const client = await Client.findById(decoded.id);

    if (!client) {
      return res.status(401).json({
        message: "Client not found",
      });
    }

    req.user = {
      id: client._id,
      role: client.role,
    };

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);

    res.status(401).json({
      message: "Unauthorized",
    });
  }
};