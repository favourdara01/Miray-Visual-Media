import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { trackView } from "../controllers/mediaController.js";

const router = express.Router();

router.post("/track-view", protect, trackView);

export default router;