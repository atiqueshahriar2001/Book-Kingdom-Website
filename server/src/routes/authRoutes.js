import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { handleValidationErrors } from "../middleware/validationMiddleware.js";
import { validateLogin, validateRegister } from "../validators/index.js";

const router = express.Router();

router.post("/register", validateRegister, handleValidationErrors, registerUser);
router.post("/login", validateLogin, handleValidationErrors, loginUser);

export default router;
