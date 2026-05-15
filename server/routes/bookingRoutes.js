import express from "express";
import {
  createBooking,
  getBookings,
  deleteBooking,
  updateBookingStatus,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC (client booking form)
router.post("/", createBooking);

// ADMIN ONLY
router.get("/", protect, getBookings);
router.delete("/:id", protect, deleteBooking);
router.put("/:id", protect, updateBookingStatus);

export default router;