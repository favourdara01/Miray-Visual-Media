import express from "express";
import {
  createBooking,
  getBookings,
  deleteBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";

// ✅ FIXED: Imported the strict admin guard rule we compiled inside your authMiddleware
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================================================
// 1. PUBLIC GATEWAY
// ========================================================
// 🌍 Public endpoint: Clients can request photography sessions from the landing form canvas
router.post("/", createBooking);

// ========================================================
// 2. ADMINISTRATIVE LOCK NODES (PROTECT + ADMIN ONLY)
// ========================================================

// 🛡️ SECURITY FIX: Standard clients are strictly unauthorized from reading full system logs
router.get("/", protect, adminOnly, getBookings);

// 🛡️ SECURITY FIX: Prevents cross-role parameter data deletion injection attempts
router.delete("/:id", protect, adminOnly, deleteBooking);

// 🛡️ SECURITY FIX: Block regular users from tampering with confirmation flags manually
router.put("/:id", protect, adminOnly, updateBookingStatus);

export default router;