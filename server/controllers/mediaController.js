import Media from "../models/Media.js";
import Gallery from "../models/Gallery.js";
import cloudinary from "../config/cloudinary.js";
import Client from "../models/Client.js";
import { sendEmail } from "../utils/sendEmail.js";
import ViewLog from "../models/ViewLog.js";

// ==========================
// 🔥 SAFE SINGLE + MULTI UPLOAD
// ==========================
export const uploadMedia = async (req, res) => {
  try {
    const files = req.files;

    const {
      clientId,
      galleryId,
      isPortfolio,
      category,
      section,
      subCategory,
    } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // 🔐 AUTH REQUIRED
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔐 BASIC VALIDATION
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "video/mp4",
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type detected",
        });
      }

      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          message: "File too large (max 10MB)",
        });
      }
    }

    if (isPortfolio !== "true" && (!clientId || !galleryId)) {
      return res.status(400).json({
        message: "Client uploads require clientId and galleryId",
      });
    }

    const uploadedMedia = [];
    let totalSizeMB = 0;

    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: file.mimetype.startsWith("video")
              ? "video"
              : "image",
            folder:
              isPortfolio === "true"
                ? "portfolio"
                : `clients/${clientId || "general"}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(file.buffer);
      });

      totalSizeMB += file.size / (1024 * 1024);

      const media = await Media.create({
        url: result.secure_url,
        public_id: result.public_id,
        type: file.mimetype.startsWith("video")
          ? "video"
          : "image",

        client: isPortfolio === "true" ? null : clientId,
        gallery: isPortfolio === "true" ? null : galleryId,

        isPortfolio: isPortfolio === "true",
        section: section || "Events",
        subCategory: subCategory || "",
        category: category || "Uncategorized",

        uploadedBy: req.user.id,
      });

      uploadedMedia.push(media);
    }

    // update storage safely
    if (clientId) {
      await Client.findByIdAndUpdate(clientId, {
        $inc: { storageUsed: Number(totalSizeMB.toFixed(2)) },
      });
    }

    // socket safely
    if (req.io && clientId) {
      req.io.to(clientId).emit("new-media", {
        message: "New photos uploaded",
      });
    }

    return res.status(201).json({
      message: "Upload successful",
      data: uploadedMedia,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return res.status(500).json({
      message: "Server error during upload",
    });
  }
};

// ==========================
// BULK UPLOAD (SAFE)
// ==========================
export const uploadBulkMedia = async (req, res) => {
  try {
    const files = req.files;
    const { clientId, galleryId, section, subCategory } =
      req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (!clientId || !galleryId) {
      return res.status(400).json({
        message: "Missing clientId or galleryId",
      });
    }

    const uploadedMedia = [];
    let totalSizeMB = 0;

    for (const file of files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: file.mimetype.startsWith("video")
              ? "video"
              : "image",
            folder: `clients/${clientId}/gallery/${galleryId}`,
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        );

        stream.end(file.buffer);
      });

      totalSizeMB += file.size / (1024 * 1024);

      const media = await Media.create({
        url: result.secure_url,
        public_id: result.public_id,
        type: file.mimetype.startsWith("video")
          ? "video"
          : "image",
        client: clientId,
        gallery: galleryId,
        section: section || "Events",
        subCategory: subCategory || "",
        uploadedBy: req.user.id,
      });

      uploadedMedia.push(media);
    }

    await Client.findByIdAndUpdate(clientId, {
      $inc: { storageUsed: Number(totalSizeMB.toFixed(2)) },
    });

    return res.status(201).json({
      message: "Bulk upload successful",
      data: uploadedMedia,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// SAFE DELETE MEDIA
// ==========================
export const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // 🔐 ownership check
    if (
      media.uploadedBy &&
      media.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (media.public_id) {
      await cloudinary.uploader.destroy(media.public_id, {
        resource_type: media.type === "video" ? "video" : "image",
      });
    }

    await Media.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// SAFE VIEW TRACKING
// ==========================
export const trackView = async (req, res) => {
  try {
    const { mediaId } = req.body;

    if (!mediaId) {
      return res.status(400).json({ message: "mediaId required" });
    }

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;

    const exists = await ViewLog.findOne({
      media: mediaId,
      ip,
    });

    if (!exists) {
      await ViewLog.create({
        media: mediaId,
        client: req.user?.id,
        ip,
        location: "Nigeria",
      });

      await Media.findByIdAndUpdate(mediaId, {
        $inc: { views: 1 },
      });
    }

    res.json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// SAFE DOWNLOAD TRACKING
// ==========================
export const trackDownload = async (req, res) => {
  try {
    const { mediaId } = req.body;

    if (!mediaId) {
      return res.status(400).json({ message: "mediaId required" });
    }

    await Media.findByIdAndUpdate(mediaId, {
      $inc: { downloads: 1 },
    });

    res.json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllMedia = async (req, res) => {
  try {
    // optional: protect route
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // optional: pagination (VERY important for SaaS scaling)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const media = await Media.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v"); // hide mongoose metadata

    const total = await Media.countDocuments();

    res.json({
      data: media,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET ALL MEDIA ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalMedia = await Media.countDocuments();

    const views = await Media.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const downloads = await Media.aggregate([
      { $group: { _id: null, total: { $sum: "$downloads" } } },
    ]);

    res.json({
      totalMedia,
      totalViews: views[0]?.total || 0,
      totalDownloads: downloads[0]?.total || 0,
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getClientMedia = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const media = await Media.find({ client: req.user.id })
      .sort({ createdAt: -1 });

    res.json(media);
  } catch (err) {
    console.error("GET CLIENT MEDIA ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMediaByClient = async (req, res) => {

    if (
  req.user.role !== "admin" &&
  req.user.id !== req.params.clientId
) {
  return res.status(403).json({
    message: "Access denied",
  });
}

  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: "clientId required" });
    }

    const media = await Media.find({ client: clientId })
      .sort({ createdAt: -1 });

    res.json(media);
  } catch (err) {
    console.error("GET MEDIA BY CLIENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMediaByGallery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "gallery id required" });
    }

    const media = await Media.find({ gallery: id })
      .sort({ createdAt: -1 });

    res.json(media);
  } catch (err) {
    console.error("GET MEDIA BY GALLERY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStorage = async (req, res) => {
  try {
    // optional security check
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Cloudinary usage API
    const result = await cloudinary.api.usage();

    res.json({
      storage: {
        used: result.storage?.usage || 0,
        limit: result.storage?.limit || 0,
        plan: result.plan || "unknown",
      },
      bandwidth: {
        used: result.bandwidth?.usage || 0,
      },
      resources: {
        images: result.resources?.images || 0,
        videos: result.resources?.videos || 0,
      },
    });
  } catch (err) {
    console.error("CLOUDINARY STORAGE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch storage info" });
  }
};

export const getPortfolioMedia = async (req, res) => {
  try {
    const media = await Media.find({
      isPortfolio: true,
    }).sort({ createdAt: -1 });

    res.json(media);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};