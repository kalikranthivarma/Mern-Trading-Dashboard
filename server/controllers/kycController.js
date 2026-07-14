import path from "path";
import Kyc from "../models/Kyc.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

// @desc    Upload KYC Documents
// @route   POST /api/kyc/upload
// @access  Private
export const uploadKycDocuments = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      throw new ApiError(400, "No files were uploaded.");
    }

    // Helper to generate access URL for saved files
    const getFileUrl = (fieldname) => {
      const file = req.files[fieldname]?.[0];
      if (!file) return undefined;
      // In production, this would be your server domain or a cloud URL.
      // E.g., process.env.API_URL + '/uploads/kyc/' + file.filename
      return `/uploads/kyc/${file.filename}`;
    };

    const documentUrls = {
      identityDocument: getFileUrl("identityDocument"),
      panCard: getFileUrl("panCard"),
      aadhaarFront: getFileUrl("aadhaarFront"),
      aadhaarBack: getFileUrl("aadhaarBack"),
      passport: getFileUrl("passport"),
      drivingLicense: getFileUrl("drivingLicense"),
      selfie: getFileUrl("selfie"),
      addressProof: getFileUrl("addressProof"),
    };

    // Remove undefined fields
    Object.keys(documentUrls).forEach(
      (key) => documentUrls[key] === undefined && delete documentUrls[key]
    );

    let kyc = await Kyc.findOne({ user: req.user._id });

    if (kyc) {
      // Update existing record
      Object.keys(documentUrls).forEach(key => {
        kyc.documents[key] = documentUrls[key];
      });
      kyc.status = "pending";
      kyc.remarks = "";
      await kyc.save();
    } else {
      // Create new record
      kyc = await Kyc.create({
        user: req.user._id,
        documents: documentUrls,
        status: "pending",
      });
    }

    // Update user kycStatus
    await User.findByIdAndUpdate(req.user._id, { kycStatus: "pending" });

    // Note: Here you would ideally trigger a "KYC Submitted" email notification
    // using your emailHelper.

    res.status(200).json({
      success: true,
      message: "KYC documents uploaded successfully. Status set to Pending.",
      data: kyc,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User KYC Status
// @route   GET /api/kyc/my-status
// @access  Private
export const getMyKycStatus = async (req, res, next) => {
  try {
    const kyc = await Kyc.findOne({ user: req.user._id });
    
    if (!kyc) {
      return res.status(200).json({
        success: true,
        data: {
          status: "unverified",
          documents: {},
        },
      });
    }

    res.status(200).json({
      success: true,
      data: kyc,
    });
  } catch (error) {
    next(error);
  }
};
