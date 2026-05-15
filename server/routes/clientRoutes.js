import express from "express";
import {
  createClient,
  loginClient,
  getClients,
  deleteClient,
  getSingleClient,
} from "../controllers/clientController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

import bcrypt from "bcryptjs";

const router = express.Router();

// ✅ Public routes
router.post("/create", createClient);
router.post("/login", loginClient);

// ✅ Protected + Admin only (must be before /:id)
router.get("/", protect, adminOnly, getClients);
router.delete("/:id", protect, adminOnly, deleteClient);

// ✅ Dynamic route last
router.get("/:id", getSingleClient);

export default router;





// ✅ Temporary password reset - DELETE AFTER USE
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  const hashed = await bcrypt.hash(newPassword, 10);
  await Client.findOneAndUpdate({ email }, { password: hashed });
  res.json({ message: "Password reset" });
});