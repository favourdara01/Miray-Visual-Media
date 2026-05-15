import express from "express";
import archiver from "archiver";
import Media from "../models/Media.js";
import https from "https";

const router = express.Router();

/**
 * Get HTTPS stream safely
 */
function getStream(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error("Bad status: " + res.statusCode));
        }
        resolve(res);
      })
      .on("error", reject);
  });
}

/**
 * =========================
 * DOWNLOAD FULL ALBUM (ZIP)
 * =========================
 */
router.get("/album/:id", async (req, res) => {
  try {
    const galleryId = req.params.id;

    const media = await Media.find({ gallery: galleryId });

    console.log("🔥 MEDIA FOUND:", media.length);

    if (!media.length) {
      return res.status(404).json({ message: "No media found" });
    }

    // =========================
    // HEADERS
    // =========================
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=album-${galleryId}.zip`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("🔥 ARCHIVE ERROR:", err);
      throw err;
    });

    archive.pipe(res);

    // =========================
    // ADD FILES
    // =========================
    for (let i = 0; i < media.length; i++) {
      const file = media[i];

      if (!file.url) {
        console.log("❌ Missing URL:", file._id);
        continue;
      }

      console.log("📸 IMAGE URL:", file.url);

      try {
        const stream = await getStream(file.url);

        archive.append(stream, {
          name: `media-${i + 1}.jpg`,
        });
      } catch (err) {
        console.log("❌ Failed file:", file.url);
      }
    }

    // =========================
    // TRACK DOWNLOADS (🔥 FIX FOR YOUR DASHBOARD)
    // =========================
    await Media.updateMany(
      { gallery: galleryId },
      { $inc: { downloads: 1 } }
    );

    console.log("📊 DOWNLOAD TRACKED FOR GALLERY:", galleryId);

    // =========================
    // FINALIZE ZIP
    // =========================
    console.log("📦 FINALIZING ZIP");
    archive.finalize();
  } catch (err) {
    console.error("🔥 DOWNLOAD ERROR STACK:");
    console.error(err.message);
    console.error(err.stack);

    res.status(500).json({
      message: "Download failed",
      error: err.message,
    });
  }
});

export default router;