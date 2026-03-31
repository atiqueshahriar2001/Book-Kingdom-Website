import express from "express";
import {
  createBookReview,
  getBookById,
  getBooks
} from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleValidationErrors } from "../middleware/validationMiddleware.js";
import { validateBookId, validateBookQuery, validateBookReview } from "../validators/index.js";

const router = express.Router();

router.get("/", validateBookQuery, handleValidationErrors, getBooks);
router.get("/:id", validateBookId, handleValidationErrors, getBookById);
router.post("/:id/reviews", protect, validateBookReview, handleValidationErrors, createBookReview);

export default router;
