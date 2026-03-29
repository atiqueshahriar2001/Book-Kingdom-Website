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

  await User.create({
    name: "Admin",
    email: "admin@bookkingdom.com",
    password: "2bornot2bth@the?",
    role: "admin"
  });

  console.log("Admin seeded");
  process.exit(0);
};

seed();
