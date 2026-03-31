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

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@bookkingdom.com").toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail }).select("+role");
  if (existingAdmin) {
    console.log("Admin already exists. Skipping seed.");
    process.exit(0);
  }

  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.error("ERROR: SEED_ADMIN_PASSWORD environment variable is required.");
    process.exit(1);
  }

  await User.create({
    name: "Admin",
    email: adminEmail,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: "admin"
  });

  console.log("Admin seeded");
  process.exit(0);
};

seed();
