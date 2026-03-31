import express from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { handleValidationErrors } from "../middleware/validationMiddleware.js";
import { validateCreateOrder } from "../validators/index.js";

const router = express.Router();

router.post("/", protect, validateCreateOrder, handleValidationErrors, createOrder);
router.get("/mine", protect, getMyOrders);

export default router;
