export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.statusCode = 404;
  return next(error);
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "Invalid JSON payload",
      method: req.method,
      path: req.originalUrl,
      requestId: req.requestId,
      timestamp: req.requestTime || new Date().toISOString()
    });
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({
      message: messages.join(", "),
      method: req.method,
      path: req.originalUrl,
      requestId: req.requestId,
      timestamp: req.requestTime || new Date().toISOString()
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
      method: req.method,
      path: req.originalUrl,
      requestId: req.requestId,
      timestamp: req.requestTime || new Date().toISOString()
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      message: `Duplicate value for ${field}`,
      method: req.method,
      path: req.originalUrl,
      requestId: req.requestId,
      timestamp: req.requestTime || new Date().toISOString()
    });
  }

  const statusCode = error.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  return res.status(statusCode).json({
    message: error.message || "Server error",
    method: req.method,
    path: req.originalUrl,
    requestId: req.requestId,
    timestamp: req.requestTime || new Date().toISOString(),
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
};
