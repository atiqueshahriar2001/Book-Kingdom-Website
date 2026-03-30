import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const storage = multer.memoryStorage();

const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      return cb(new Error(`Unsupported image type: ${file.mimetype}. Allowed: ${ALLOWED_MIMETYPES.join(", ")}`), false);
    }
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return cb(new Error("File extension does not match the image content"), false);
    }
    req.fileValidated = true;
    cb(null, true);
  },
});

export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB", path: req.originalUrl, method: req.method });
    }
    return res.status(400).json({ message: `Upload error: ${error.message}`, path: req.originalUrl, method: req.method });
  }
  if (error.message && (error.message.includes("Unsupported image type") || error.message.includes("File extension"))) {
    return res.status(400).json({ message: error.message, path: req.originalUrl, method: req.method });
  }
  next(error);
};

export const uploadToCloudinary = (folder) => async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({ message: "Image upload service is not configured" });
  }

  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    });

    req.file.cloudinaryUrl = result.secure_url;
    req.file.cloudinaryPublicId = result.public_id;
    req.file.uploadedBy = req.user?._id;
    req.file.uploadedAt = new Date();

    next();
  } catch (error) {
    return res.status(500).json({ message: `File upload failed: ${error.message}` });
  }
};

export default upload;
