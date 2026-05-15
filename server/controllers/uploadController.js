import Media from "../models/Media.js";
import nodemailer from "nodemailer";
import ViewLog from "../models/ViewLog.js";
import Client from "../models/Client.js";

// ================= UPLOAD MEDIA =================
export const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    if (!req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const { clientId, album, type } = req.body;

    const uploaded = await Promise.all(
      req.files.map((file) =>
        Media.create({
          url: file.path,
          clientId,
          album,
          type,
          uploadedBy: req.user.id,
        })
      )
    );

    res.status(201).json(uploaded);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Upload failed" });
  }
};

// ================= GET ALL MEDIA (🔥 MISSING FIX) =================
export const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch media" });
  }
};

// ================= GET GALLERY =================
export const getGallery = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.find({ gallery: id });

    res.json(media);
  } catch (err) {
    res.status(500).json({ msg: "Failed to load gallery" });
  }
};

// ================= STORAGE (🔥 ADD THIS FOR YOUR ADMIN PANEL) =================
export const getStorage = async (req, res) => {
  try {
    const total = await Media.countDocuments();

    res.json({
      used: total,
      limit: 1000,
    });
  } catch (err) {
    res.status(500).json({ msg: "Storage error" });
  }
};

// ================= DOWNLOAD MEDIA =================
export const downloadMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).json({ msg: "Not found" });
    }

    media.downloads += 1;
    await media.save();

    if (req.io) {
      req.io.emit("new-media", {
        message: "New download",
      });
    }

    res.json({ url: media.url });
  } catch (err) {
    res.status(500).json({ msg: "Download failed" });
  }
};