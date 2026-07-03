import express from "express";

import {
  uploadMedia,
  uploadBulkMedia,
  deleteMedia,
  trackView,
  trackDownload,
  getAllMedia,
  getClientMedia,
  getMediaByClient,
  getMediaByGallery,
  getPortfolioMedia,
  rearrangePortfolio
  getStorage,
  getAnalytics
} from "../controllers/mediaController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

import {
  downloadGallery,
  downloadGalleryZip,
  downloadSelected,
} from "../controllers/downloadController.js";

const router = express.Router();


// ================= SECURITY GROUPS =================
const auth = protect;
const admin = adminOnly;


// ================= MEDIA UPLOAD =================

// CLIENT UPLOAD
router.post(
  "/upload",
  auth,
  upload.array("files", 30),
  uploadMedia
);

// ADMIN BULK UPLOAD
router.post(
  "/upload-bulk",
  admin,
  upload.array("files", 50),
  uploadBulkMedia
);


router.get("/portfolio", getPortfolioMedia);

router.put("/rearrange", protect, adminOnly, rearrangePortfolio);

// ================= FETCH MEDIA =================

// 🔐 PROTECTED FEED (NOT PUBLIC)
router.get("/", protect, getAllMedia);

// CLIENT OWN MEDIA
router.get("/client", auth, getClientMedia);

// ADMIN OR OWNER VIEW
router.get("/client/:clientId", auth, getMediaByClient);

// GALLERY ACCESS
router.get("/gallery/:id", auth, getMediaByGallery);

// STORAGE (ADMIN ONLY)
router.get("/storage", protect, getStorage);


// ================= INTERACTIONS =================

router.post("/view", auth, trackView);
router.post("/download", auth, trackDownload);


// ================= DOWNLOADS =================

router.post("/download-selected", auth, downloadSelected);

router.get("/download-gallery/:id", auth, downloadGallery);

router.get("/download-gallery-zip/:id", auth, downloadGalleryZip);


// ================= ADMIN ACTIONS =================

router.delete("/:id", auth, deleteMedia);

router.get("/analytics", admin, getAnalytics);

export default router;