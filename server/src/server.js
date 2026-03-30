import dotenv from "dotenv";
dotenv.config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./config/db.js");

const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

const start = async () => {
  await connectDB();
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port} [${isProduction ? "production" : "development"}]`);
  });

  const shutdown = () => {
    console.log("Shutting down gracefully...");
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
