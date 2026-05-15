import express from "express";
import {
  createGallery,
  getClientGalleries,
  deleteGallery,
    getClientGalleriesById, // ← add this
  getGallery,
  setCover,
} from "../controllers/galleryController.js";
import { protectClient } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", createGallery);

router.get(
  "/client",
  protectClient,
  getClientGalleries
);
router.get("/client/:id", getClientGalleriesById); // ← add this, MUST be before /:id

router.get("/:id", getGallery);

router.delete("/:id", deleteGallery);

router.put("/:id/cover", setCover);

export default router;