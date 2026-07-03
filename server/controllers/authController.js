import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
import Session from "../models/Session.js";
import BlacklistedToken from "../models/BlacklistedToken.js";
import Admin from "../models/Admin.js";
import Client from "../models/Client.js"; // ✅ ADDED: Client database model reference
import bcrypt from "bcryptjs";

// ================= UTILITY TOKENS GENERATORS =================
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    // Short-lived credentials restrict the damage window if an active session token leaks
    { expiresIn: "15m" } 
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // ✅ FIXED: Encapsulating role safely inside payload
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// Precise cookie options targeting cross-origin security layers on Render
const cookieOptions = {
  httpOnly: true, // Prevents client-side scripts from reading token values (Blocks XSS attacks)
  secure: process.env.NODE_ENV === "production", 
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days lifespan matches token expiration limits
};

// ================= SECURE AUTHENTICATION PIPELINE ENGINE =================
const handleUserLogin = async (req, res, UserModel, userType) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All authentication inputs required" });
    }

    // Force pull password parameters explicitly since select property defaults to false in security schemas
    const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).select("+password");

    // 🛡️ SECURITY FIX: Generic errors completely obscure account validation presence
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password parameters" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password parameters" });
    }

    // Ensure the payload tracking parameter accurately handles different dashboard expectations
    const userRole = userType === "admin" ? "admin" : "client";
    user.role = userRole;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save tokens to track single-device permissions
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
    });

    await Session.create({
      userId: user._id,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      refreshToken,
    });

    res.cookie("refreshToken", refreshToken, cookieOptions);

    const userPayloadKey = userType === "admin" ? "admin" : "client";
    return res.json({
      accessToken,
      [userPayloadKey]: {
        id: user._id,
        email: user.email,
        role: userRole,
        ...(userType === "client" && { name: user.name, surname: user.surname })
      },
    });

  } catch (err) {
    console.error(`${userType.toUpperCase()} LOGIN EXCEPTION HANDLER CRASH:`, err);
    return res.status(500).json({ message: "Authentication gateway service timeout" });
  }
};

// ================= EXPORTED ROUTES CONTROLLERS =================

// ADMIN AUTHENTICATION NODE
export const loginAdmin = async (req, res) => {
  await handleUserLogin(req, res, Admin, "admin");
};

// ✅ CLIENT AUTHENTICATION NODE (INTEGRATED & HARDENED)
export const loginClient = async (req, res) => {
  await handleUserLogin(req, res, Client, "client");
};

// ================= SECURE TIMELINE REFRESH ENGINE =================
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Access authorization expired" });
    }

    // Check against active session records in MongoDB
    const stored = await RefreshToken.findOne({ token });
    if (!stored) {
      return res.status(403).json({ message: "Session track validation failure" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    // ✅ SECURITY FIX: Extract the role from the verified payload to block privilege exploits
    const newAccessToken = generateAccessToken({
      _id: decoded.id,
      role: decoded.role, 
    });

    const newRefreshToken = generateRefreshToken({
      _id: decoded.id,
      role: decoded.role
    });

    // Cycle tokens locally to invalidate reused parameters
    stored.token = newRefreshToken;
    await stored.save();

    res.cookie("refreshToken", newRefreshToken, cookieOptions);
    res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error("TOKEN REFRESH CYCLE CANCELED:", err.message);
    return res.status(401).json({ message: "Session tracking token invalidation check failed" });
  }
};

// ================= SECURE DISPATCH PURGE (LOGOUT) =================
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies.refreshToken;

    // Capture and drop existing backend database tracking loops instantly
    if (token) {
      await BlacklistedToken.create({
        token,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Blacklist lasts access expiration length (15m)
      });
    }

    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
      await Session.deleteOne({ refreshToken });
    }

    res.clearCookie("refreshToken", cookieOptions);
    return res.json({ message: "Profile session parameters cleared safely" });
  } catch (err) {
    console.error("LOGOUT FAILURE LOGS:", err);
    return res.status(500).json({ message: "Session destruction exception intercepted" });
  }
};