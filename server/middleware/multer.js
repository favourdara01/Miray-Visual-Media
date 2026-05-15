import multer from "multer";

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// IMPORTANT: field name MUST be "media"
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

export default upload;