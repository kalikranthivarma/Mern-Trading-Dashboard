import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let gridFSBucket;

/* ==========================================================
   Initialize GridFS Bucket
========================================================== */

export const initializeGridFS = () => {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB connection is not established.");
  }

  gridFSBucket = new GridFSBucket(db, {
    bucketName: "uploads",
  });

  console.log("✅ GridFS initialized successfully");
};

/* ==========================================================
   Get GridFS Bucket
========================================================== */

export const getGridFSBucket = () => {
  if (!gridFSBucket) {
    throw new Error("GridFSBucket has not been initialized.");
  }

  return gridFSBucket;
};

export default gridFSBucket;