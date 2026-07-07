import Document from "../models/Document.js";
import { uploadBufferToGridFS } from "./gridfsService.js";

export const storeDocument = async (userId, file) => {
  const gridFile = await uploadBufferToGridFS(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  return await Document.create({
    user: userId,
    filename: file.originalname,
    fileType: file.mimetype,
    size: file.size,
    gridFsId: gridFile._id,
    category: file.fieldname || "Document",
    metadata: file.metadata || {},
  });
};