import express from "express";
import { uploadMedia } from "../controllers/mediaController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/upload", upload.single("media"), uploadMedia);

export default router;