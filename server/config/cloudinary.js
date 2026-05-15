import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ================= ENV VALIDATION =================
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("❌ Missing Cloudinary environment variables");
}

// ================= CONFIG =================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,

  // 🔐 extra safety flags
  secure: true,
});

// ================= OPTIONAL SAFETY WRAPPER =================

// Safe upload helper (recommended for your controllers)
export const safeUpload = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",

        // 🔐 default safety limits
        allowed_formats: ["jpg", "png", "jpeg", "webp", "mp4"],

        // prevent weird transformations abuse
        invalidate: true,

        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

export default cloudinary;