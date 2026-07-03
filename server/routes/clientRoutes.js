import express from "express";
import {
  createClient,
  getClients,
  deleteClient,
  getSingleClient,
} from "../controllers/clientController.js";

// ✅ NEW: Import your hardened centralized authentication endpoints
import { loginClient } from "../controllers/authController.js"; 

// Bring in our optimized protection middleware layers
import { protect, adminOnly, clientOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================================================
// 1. PUBLIC ENDPOINTS
// ========================================================

// 🌍 Client Login Gateway - Handled securely via HTTP-Only cookie cycle nodes
router.post("/login", loginClient);

// ========================================================
// 2. ADMINISTRATIVE CONTROL ENDPOINTS (ADMIN ONLY)
// ========================================================

// 🛡️ Secure Client Creation: Restricted completely to active administrative dashboard sessions
router.post("/create", protect, adminOnly, createClient);

// 🛡️ Secure Collection Fetching: Read current directory listings safely
router.get("/", protect, adminOnly, getClients);

// 🛡️ Secure Eviction: Wipes a user database registration partition cleanly from server arrays
router.delete("/:id", protect, adminOnly, deleteClient);

// ========================================================
// 3. PRIVATE CLIENT WORKSPACE ENDPOINTS (CLIENT / ADMIN)
// ========================================================

// 🛡️ SECURITY FIX: Enforced access token validation checks.
// This intercepts requests to make sure a regular client can only open their OWN gallery profile ID!
router.get("/:id", protect, clientOnly, getSingleClient);

export default router;