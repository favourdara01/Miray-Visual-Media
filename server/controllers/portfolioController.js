import Media from "../models/Media.js";
import cloudinary from "../config/cloudinary.js";

// =====================
// UPLOAD TO PORTFOLIO
// =====================
export const uploadPortfolioMedia = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // upload to cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    const media = await Media.create({
      url: result.secure_url,
      type: file.mimetype.startsWith("video") ? "video" : "image",
      isPortfolio: true,
      caption: req.body.caption || "",
      shootDate: req.body.shootDate || new Date(),
    });

    res.status(201).json(media);
  } catch (err) {
    console.error("PORTFOLIO UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// =====================
// GET PORTFOLIO MEDIA
// =====================
export const getPortfolioMedia = async (req, res) => {
  try {
    const media = await Media.find({ isPortfolio: true }).sort({
      createdAt: -1,
    });

    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};