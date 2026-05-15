import multer from "multer";

// ================= MEMORY STORAGE =================
const storage = multer.memoryStorage();

// ================= SAFE MIME TYPES =================
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
]);

// ================= FILE FILTER =================
const fileFilter = (req, file, cb) => {
  try {
    // 🔐 MIME check
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(
        new Error("Invalid file type detected"),
        false
      );
    }

    // 🔐 filename safety check (basic protection)
    if (file.originalname.includes("..")) {
      return cb(new Error("Invalid file name"), false);
    }

    cb(null, true);
  } catch (err) {
    cb(err, false);
  }
};

// ================= MULTER CONFIG =================
const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 20 * 1024 * 1024, // 🔥 reduced to 20MB per file (safer)
    files: 30, // 🔥 hard limit per request
  },
});

// ================= ERROR HANDLER WRAPPER =================
export const uploadMiddleware = (req, res, next) => {
  const handler = upload.array("files", 30);

  handler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: `Upload error: ${err.message}`,
      });
    }

    if (err) {
      return res.status(400).json({
        message: err.message,
      });
    }

    next();
  });
};

export default upload;