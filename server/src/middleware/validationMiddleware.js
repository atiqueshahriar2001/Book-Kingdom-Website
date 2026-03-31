import { validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: "Validation failed",
    errors: errors.array().map((error) => ({
      field: error.type === "field" ? error.path : undefined,
      message: error.msg
    }))
  });
};
