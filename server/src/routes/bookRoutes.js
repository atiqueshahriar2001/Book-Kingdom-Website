import express from "express";
import {
  createBookReview,
  getBookById,
  getBooks
} from "../controllers/bookController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/:id/reviews", protect, createBookReview);

export default router;
