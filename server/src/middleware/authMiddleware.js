import jwt from "jsonwebtoken";
import User from "../models/User.js";

const buildErrorPayload = (req, message) => ({
  message,
  method: req.method,
  path: req.originalUrl,
  requestId: req.requestId,
  timestamp: req.requestTime || new Date().toISOString()
});

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json(buildErrorPayload(req, "Not authorized"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password +role");

    if (!req.user) {
      return res.status(401).json(buildErrorPayload(req, "User not found"));
    }

    return next();
  } catch (err) {
    return res.status(401).json(buildErrorPayload(req, "Not authorized, token invalid"));
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json(buildErrorPayload(req, "Admin access required"));
  }
  return next();
};
