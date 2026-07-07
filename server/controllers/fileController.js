import { ObjectId } from "mongodb";
import { getGridFSBucket } from "../gridfs/gridfs.js";
import { storeDocument } from "../services/fileService.js";

/* ==========================================================
   Upload Single File
========================================================== */

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a file to upload.",
      });
    }

    const document = await storeDocument(req.user._id, req.file);

    res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Download File
========================================================== */

export const getFile = async (req, res, next) => {
  try {
    const bucket = getGridFSBucket();

    const file = await bucket
      .find({
        _id: new ObjectId(req.params.id),
      })
      .next();

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    res.set({
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="${file.filename}"`,
    });

    bucket.openDownloadStream(file._id).pipe(res);
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Delete File
========================================================== */

export const deleteFile = async (req, res, next) => {
  try {
    const bucket = getGridFSBucket();

    const fileId = new ObjectId(req.params.id);

    await bucket.delete(fileId);

    res.status(200).json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   List Files
========================================================== */

export const getAllFiles = async (req, res, next) => {
  try {
    const bucket = getGridFSBucket();

    const files = await bucket.find({}).toArray();

    res.status(200).json({
      success: true,
      count: files.length,
      data: files,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   File Metadata
========================================================== */

export const getFileMetadata = async (req, res, next) => {
  try {
    const bucket = getGridFSBucket();

    const file = await bucket
      .find({
        _id: new ObjectId(req.params.id),
      })
      .next();

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};