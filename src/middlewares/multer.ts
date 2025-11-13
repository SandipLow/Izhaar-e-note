import multer from "multer";

const storage = multer.memoryStorage();
const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB 
const upload = multer({ storage });

export default upload;