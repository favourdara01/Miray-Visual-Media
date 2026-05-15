const express = require("express");
const archiver = require("archiver");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.post("/download", async (req, res) => {
  const { files } = req.body; // array of image paths

  if (!files || files.length === 0) {
    return res.status(400).json({ msg: "No files selected" });
  }

  res.attachment("gallery.zip");

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  archive.pipe(res);

  files.forEach((file) => {
    const filePath = path.join(__dirname, "../uploads", file);

    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file });
    }
  });

  archive.finalize();
});

module.exports = router;