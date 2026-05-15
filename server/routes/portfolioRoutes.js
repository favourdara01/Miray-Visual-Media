import express from "express";
import {
  uploadPortfolioMedia,
  getPortfolioMedia,
} from "../controllers/portfolioController.js";

import upload from "../middleware/upload.js"; // multer

const router = express.Router();

router.post("/upload", upload.single("file"), uploadPortfolioMedia);
router.get("/", getPortfolioMedia);

export default router;