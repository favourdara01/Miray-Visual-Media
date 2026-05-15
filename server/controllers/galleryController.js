import Gallery from "../models/Gallery.js";
import Client from "../models/Client.js";
import Media from "../models/Media.js";
import transporter from "../config/email.js";
import mongoose from "mongoose";

// ==========================
// CREATE GALLERY (ADMIN)
// ==========================
export const createGallery = async (req, res) => {
  try {
    const { title, clientId } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title required" });
    }

    const gallery = await Gallery.create({
      title,
      client: clientId || req.user.id,
      coverImage: "",
      published: false,
    });

    res.status(201).json(gallery);
  } catch (err) {
    console.error("CREATE GALLERY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// GET SINGLE GALLERY
// ==========================
export const getGallery = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid gallery ID" });
    }

    const gallery = await Gallery.findById(id).populate(
      "client",
      "name email"
    );

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    res.json(gallery);
  } catch (err) {
    console.error("GET GALLERY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// GET CLIENT GALLERIES (FIXED WITH REAL PHOTO COUNT)
// ==========================
export const getClientGalleries = async (req, res) => {
  try {
    if (!req.user) {
  return res.status(401).json({
    message: "Unauthorized",
  });
}

const galleries = await Gallery.find({
  client: req.user.id,
}).sort({
  createdAt: -1,
});

    // 🔥 REAL MEDIA COUNT PER GALLERY
    const formatted = await Promise.all(
      galleries.map(async (g) => {
        const count = await Media.countDocuments({ gallery: g._id });

        return {
          ...g.toObject(),
          count, // 👈 THIS FIXES YOUR DASHBOARD PHOTO COUNT
        };
      })
    );

    res.json(formatted);
  } catch (err) {
    console.error("GET CLIENT GALLERY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// DELETE GALLERY
// ==========================
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    res.json({ message: "Gallery deleted" });
  } catch (err) {
    console.error("DELETE GALLERY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// SET COVER IMAGE (FIXED)
// ==========================
export const setCover = async (req, res) => {
  try {
    const { imageUrl, mediaId } = req.body;

    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    let finalImage = imageUrl;

    // If mediaId is sent, fetch media from DB
    if (mediaId) {
      const Media = (await import("../models/Media.js")).default;
      const media = await Media.findById(mediaId);

      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }

      finalImage = media.url;
    }

    if (!finalImage) {
      return res.status(400).json({ message: "No image provided" });
    }

    gallery.coverImage = finalImage;
    await gallery.save();

    res.json({
      message: "Cover updated successfully",
      gallery,
    });
  } catch (err) {
    console.error("SET COVER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// ==========================
// PUBLISH GALLERY + EMAIL
// ==========================
export const publishGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id).populate("client");

    if (!gallery) {
      return res.status(404).json({ message: "Gallery not found" });
    }

    gallery.published = true;
    await gallery.save();

    if (gallery.client?.email) {
      await transporter.sendMail({
        to: gallery.client.email,
        subject: "📸 Your Gallery is Ready!",
        html: `
          <div style="font-family:Arial">
            <h2>Hello ${gallery.client.name},</h2>
            <p>Your gallery <b>${gallery.title}</b> is now ready.</p>
            <p>You can view your photos by logging in:</p>
            <a href="http://localhost:5173/client/login">
              View Your Gallery
            </a>
            <br/><br/>
            <p>Thank you for trusting us ❤️</p>
          </div>
        `,
      });
    }

    res.json({
      message: "Gallery published and email sent",
      gallery,
    });
  } catch (err) {
    console.error("PUBLISH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ==========================
// GET CLIENT GALLERIES BY ID (ADMIN)
// ==========================
export const getClientGalleriesById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const galleries = await Gallery.find({ client: id }).sort({ createdAt: -1 });

    const formatted = await Promise.all(
      galleries.map(async (g) => {
        const count = await Media.countDocuments({ gallery: g._id });
        return { ...g.toObject(), count };
      })
    );

    res.json(formatted); // plain array — matches what AdminClientsPage expects
  } catch (err) {
    console.error("GET CLIENT GALLERIES BY ID ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};