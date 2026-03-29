import express from "express";
import {
  createBook,
  deleteBook,
  getAdminBooks,
  getDashboardStats,
  getOrders,
  getUsers,
  deleteUser,
  updateBook,
  updateOrderStatus,
  updateUserRole
} from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import upload, { uploadToCloudinary } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/stats", getDashboardStats);
router.get("/books", getAdminBooks);
router.post("/books", upload.single("image"), uploadToCloudinary("book-kingdom/books"), createBook);
router.put("/books/:id", upload.single("image"), uploadToCloudinary("book-kingdom/books"), updateBook);
router.delete("/books/:id", deleteBook);
router.get("/users", getUsers);
router.put("/users/:id", updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/orders", getOrders);
router.put("/orders/:id", updateOrderStatus);

export default router;
