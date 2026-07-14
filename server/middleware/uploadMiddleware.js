import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads", "kyc");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set Storage Engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate secure filename: fieldname-userId-timestamp.ext
    const ext = path.extname(file.originalname);
    const safeName = `${file.fieldname}-${req.user?._id || "temp"}-${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images and PDFs only! (jpeg, jpg, png, pdf)"));
  }
};

// Initialize Upload
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});