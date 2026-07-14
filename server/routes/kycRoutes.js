import express from "express";
import { uploadKycDocuments, getMyKycStatus } from "../controllers/kycController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadMiddleware } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/upload",
  uploadMiddleware.fields([
    { name: "identityDocument", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
  ]),
  uploadKycDocuments
);

router.get("/my-status", getMyKycStatus);

export default router;
