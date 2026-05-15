import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    // CLIENT OWNER (optional for portfolio)
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      default: null,
      index: true,
    },

    public_id: {
  type: String,
  required: true,
},

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },

    // GALLERY (optional for portfolio)
    gallery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gallery",
      default: null,
      index: true,
    },

    album: {
      type: String,
      default: "",
    },

    shootDate: {
      type: Date,
      default: Date.now,
    },

    // PORTFOLIO SYSTEM
    isPortfolio: {
      type: Boolean,
      default: false,
      index: true,
    },

   

    // 🔥 NEW (MAIN SECTION)
    section: {
      type: String,
      enum: ["Events", "Portrait", "Headshot"],
      default: "Events",
      index: true,
    },

    subCategory: {
  type: String,
  default: "",
  index: true,
},

    caption: {
      type: String,
      default: "",
    },

    views: {
      type: Number,
      default: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);