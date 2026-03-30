import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const seed = async () => {
  if (process.env.NODE_ENV === "production") {
    console.error("Cannot seed in production environment. Aborting.");
    process.exit(1);
  }

  await connectDB();

  const existingAdmin = await User.findOne({ email: "admin@bookkingdom.com" }).select("+role");
  if (existingAdmin) {
    console.log("Admin already exists. Skipping seed.");
    process.exit(0);
  }

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.warn("WARNING: SEED_ADMIN_PASSWORD not set. Using default password. Change it immediately.");
  }

  await User.create({
    name: "Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@bookkingdom.com",
    password: process.env.SEED_ADMIN_PASSWORD || "changeme",
    role: "admin"
  });

  console.log("Admin seeded");
  process.exit(0);
};

seed();
