import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { uploadSingle, uploadMultiple } from "../middleware/uploadMiddleware.js";

import {
  uploadFile,
  getFile,
  getAllFiles,
  getFileMetadata,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();

/* ==========================================================
   Upload Single File
========================================================== */

router.post(
  "/upload",
  protect,
  uploadSingle,
  uploadFile
);

/* ==========================================================
   Upload Multiple Files
========================================================== */

router.post(
  "/upload-multiple",
  protect,
  uploadMultiple,
  uploadFile
);

/* ==========================================================
   Get All Files
========================================================== */

router.get(
  "/",
  protect,
  getAllFiles
);

/* ==========================================================
   Get File Metadata
========================================================== */

router.get(
  "/meta/:id",
  protect,
  getFileMetadata
);

/* ==========================================================
   Download / Preview File
========================================================== */

router.get(
  "/:id",
  protect,
  getFile
);

/* ==========================================================
   Delete File
========================================================== */

router.delete(
  "/:id",
  protect,
  deleteFile
);

export default router;