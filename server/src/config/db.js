import mongoose from "mongoose";

mongoose.set("strictQuery", true);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }

  const isProduction = process.env.NODE_ENV === "production";
  const serverSelectionTimeoutMS = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || (isProduction ? 10000 : 5000);
  const socketTimeoutMS = Number(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000;

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (error) => {
    console.error(`MongoDB runtime error: ${error.message}`);
  });

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS,
    socketTimeoutMS,
    maxPoolSize: isProduction ? 10 : 5,
    autoIndex: !isProduction
  });

  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

export default connectDB;
