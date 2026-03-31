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
import { handleValidationErrors } from "../middleware/validationMiddleware.js";
import upload, { uploadToCloudinary, handleMulterError } from "../middleware/uploadMiddleware.js";
import {
  validateAdminBookCreate,
  validateAdminBookUpdate,
  validateAdminBooksQuery,
  validateAdminOrdersQuery,
  validateAdminStatsQuery,
  validateAdminUsersQuery,
  validateObjectIdParam,
  validateOrderStatusUpdate,
  validateUserRoleUpdate
} from "../validators/index.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/stats", validateAdminStatsQuery, handleValidationErrors, getDashboardStats);
router.get("/books", validateAdminBooksQuery, handleValidationErrors, getAdminBooks);
router.post(
  "/books",
  upload.single("image"),
  validateAdminBookCreate,
  handleValidationErrors,
  uploadToCloudinary("book-kingdom/books"),
  createBook
);
router.put(
  "/books/:id",
  upload.single("image"),
  validateAdminBookUpdate,
  handleValidationErrors,
  uploadToCloudinary("book-kingdom/books"),
  updateBook
);
router.delete("/books/:id", validateObjectIdParam("id"), handleValidationErrors, deleteBook);
router.get("/users", validateAdminUsersQuery, handleValidationErrors, getUsers);
router.put("/users/:id", validateUserRoleUpdate, handleValidationErrors, updateUserRole);
router.delete("/users/:id", validateObjectIdParam("id"), handleValidationErrors, deleteUser);
router.get("/orders", validateAdminOrdersQuery, handleValidationErrors, getOrders);
router.put("/orders/:id", validateOrderStatusUpdate, handleValidationErrors, updateOrderStatus);
router.use(handleMulterError);

export default router;
