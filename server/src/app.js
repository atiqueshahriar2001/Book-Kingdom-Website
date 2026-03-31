import { randomUUID } from "crypto";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");

const allowedOrigins = [
  "https://bookkingdom.netlify.app",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [])
]
  .map(normalizeOrigin)
  .filter((origin, index, list) => list.indexOf(origin) === index);

app.use((req, res, next) => {
  req.requestId = randomUUID();
  req.requestTime = new Date().toISOString();
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = origin ? normalizeOrigin(origin) : origin;
      if (!normalizedOrigin || allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        const error = new Error("Not allowed by CORS");
        error.statusCode = 403;
        callback(error);
      }
    },
    credentials: true
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Book Kingdom API is running",
    requestId: req.requestId
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: req.requestTime,
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl
  });
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
