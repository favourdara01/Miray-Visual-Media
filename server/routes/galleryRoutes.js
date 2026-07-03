import express from "express";
import {
  createGallery,
  getClientGalleries,
  deleteGallery,
  getClientGalleriesById, 
  getGallery,
  setCover,
} from "../controllers/galleryController.js";

// ✅ FIXED: Imported the updated, secure middleware components
import { protect, adminOnly, clientOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================================================
// 1. CLIENT WORKSPACE ACCESS (SECURE & RE-MAPPED)
// ========================================================

// 🛡️ Secure Client Portfolio Fetching: Pulls active galleries linked to the logged-in client account
router.get("/client", protect, clientOnly, getClientGalleries);

// 🛡️ Secure Specified Lookup: Validates partition parameters before rendering the sub-gallery assets
router.get("/client/:id", protect, clientOnly, getClientGalleriesById); 

// ========================================================
// 2. ADMINISTRATIVE OPERATIONS CONTROL (ADMIN ONLY)
// ========================================================

// 🛡️ Secure Creation: Restricted completely to your admin session dashboard
router.post("/create", protect, adminOnly, createGallery);

// 🛡️ Secure Erasure: Prevents malicious automated deletion scripts
router.delete("/:id", protect, adminOnly, deleteGallery);

// 🛡️ Secure Upgrades: Restricts presentation adjustments to verified administrators
router.put("/:id/cover", protect, adminOnly, setCover);

// ========================================================
// 3. PUBLIC LOOKUP PIPELINE
// ========================================================
// 🌍 Public endpoint: Allows portfolio display visitors to open public galleries by ID link
router.get("/:id", getGallery);

export default router;