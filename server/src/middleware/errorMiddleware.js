export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.statusCode = 404;
  return next(error);
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({ message: `Duplicate value for ${field}` });
  }

  const statusCode = error.statusCode || res.statusCode || 500;
  return res.status(statusCode).json({
    message: error.message || "Server error",
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};
