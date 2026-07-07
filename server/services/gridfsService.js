import { Readable } from "stream";
import { getGridFSBucket } from "../gridfs/gridfs.js";

export const uploadBufferToGridFS = (
  buffer,
  filename,
  mimetype
) => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
    });

    const readableStream = Readable.from(buffer);

    readableStream
      .pipe(uploadStream)
      .on("error", (error) => reject(error))
      .on("finish", () => {
        resolve({
          _id: uploadStream.id,
          filename: uploadStream.filename,
          contentType: mimetype,
        });
      });
  });
};