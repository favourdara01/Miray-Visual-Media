import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
import Session from "../models/Session.js";
import BlacklistedToken from "../models/BlacklistedToken.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

// ================= TOKENS =================
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
// ================= LOGIN =================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN REQUEST:", req.body);

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (!admin.password) {
      return res.status(500).json({ message: "Admin password missing in DB" });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    await RefreshToken.create({
      token: refreshToken,
      userId: admin._id,
    });

    await Session.create({
      userId: admin._id,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      refreshToken,
    });

    res.cookie(
  "refreshToken",
  refreshToken,
  cookieOptions
);

    return res.json({
      accessToken,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ================= REFRESH =================
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const stored = await RefreshToken.findOne({ token });

    if (!stored) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const newAccessToken = generateAccessToken({
      _id: decoded.id,
      role: "admin",
    });

    const newRefreshToken = generateRefreshToken({
      _id: decoded.id,
    });

    stored.token = newRefreshToken;
    await stored.save();

    res.cookie(
  "refreshToken",
  newRefreshToken,
  cookieOptions
);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: "Refresh failed" });
  }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      await BlacklistedToken.create({
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    res.clearCookie(
  "refreshToken",
  cookieOptions
);

    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};