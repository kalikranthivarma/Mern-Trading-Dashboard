import multer from "multer";

/* ==========================================================
   Allowed File Types
========================================================== */

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "text/csv",
];

/* ==========================================================
   Multer Memory Storage
========================================================== */

const storage = multer.memoryStorage();

/* ==========================================================
   File Filter
========================================================== */

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, JPG, JPEG, PNG, DOCX, XLSX and CSV files are allowed."
      ),
      false
    );
  }
};

/* ==========================================================
   Upload Configuration
========================================================== */

const upload = multer({
  storage,

  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
    files: 10,
  },

  fileFilter,
});

/* ==========================================================
   Export Upload Middleware
========================================================== */

export const uploadSingle = upload.single("file");

export const uploadMultiple = upload.array("files", 10);

export default upload;