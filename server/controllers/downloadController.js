import archiver from "archiver";
import Media from "../models/Media.js";
import axios from "axios";
import Gallery from "../models/Gallery.js";

// ==========================
// DOWNLOAD SELECTED MEDIA (FIXED)
// ==========================
export const downloadSelected = async (req, res) => {
  try {
    const { mediaIds } = req.body;

    if (!mediaIds || mediaIds.length === 0) {
      return res.status(400).json({ message: "No media selected" });
    }

    const mediaFiles = await Media.find({
      _id: { $in: mediaIds },
    });

    // increment downloads
    await Media.updateMany(
      { _id: { $in: mediaIds } },
      { $inc: { downloads: 1 } }
    );

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=media.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (let i = 0; i < mediaFiles.length; i++) {
      const file = mediaFiles[i];

      const response = await axios.get(file.url, {
        responseType: "stream",
      });

      archive.append(response.data, {
        name: `media-${i}.${file.type === "video" ? "mp4" : "jpg"}`,
      });
    }

    archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================
// DOWNLOAD GALLERY (FIXED + FAST)
// ==========================
export const downloadGallery = async (req, res) => {
  try {
    const media = await Media.find({ gallery: req.params.id });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=gallery.zip"
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (let i = 0; i < media.length; i++) {
      const file = media[i];

      const response = await axios.get(file.url, {
        responseType: "stream",
      });

      archive.append(response.data, {
        name: `image-${i}.${file.type === "video" ? "mp4" : "jpg"}`,
      });
    }

    archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// DOWNLOAD GALLERY ZIP (FIXED + SAFE)
// ==========================
export const downloadGalleryZip = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    const media = await Media.find({ gallery: req.params.id });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${gallery.title}.zip"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (let i = 0; i < media.length; i++) {
      const file = media[i];

      const response = await axios.get(file.url, {
        responseType: "stream",
      });

      archive.append(response.data, {
        name: file.url.split("/").pop(),
      });
    }

    archive.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};