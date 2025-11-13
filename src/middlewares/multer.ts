import multer from "multer";

const storage = multer.memoryStorage();
const limits = { fileSize: 0.5 * 1024 * 1024 }; // 0.5 MB file size limit
const upload = multer({ storage, limits });

export default upload;