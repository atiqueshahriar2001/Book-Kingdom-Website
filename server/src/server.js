import dotenv from "dotenv";
dotenv.config();

const { default: app } = await import("./app.js");
const { default: connectDB } = await import("./config/db.js");

const port = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start();
