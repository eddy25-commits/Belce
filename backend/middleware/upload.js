const multer = require("multer");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// Files are held in memory only long enough to be streamed straight to
// Supabase Storage (see utils/imageStorage.js) — nothing touches local disk,
// which matters on hosts like Render/Railway with ephemeral filesystems.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or WEBP image files are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter,
});

module.exports = upload;
