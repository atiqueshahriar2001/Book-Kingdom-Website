import express from "express";
import {
  changePassword,
  clearCart,
  getProfile,
  toggleWishlist,
  updateCart,
  updateProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload, { uploadToCloudinary, handleMulterError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profilePhoto"), uploadToCloudinary("book-kingdom/profiles"), updateProfile);
router.put("/password", protect, changePassword);
router.put("/wishlist/:bookId", protect, toggleWishlist);
router.put("/cart", protect, updateCart);
router.delete("/cart", protect, clearCart);
router.use(handleMulterError);

export default router;
