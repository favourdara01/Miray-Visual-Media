import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    const existingAdmin = await Admin.findOne({
      email: "admin@miray.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists ⚠️");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await Admin.create({
      email: "admin@miray.com",
      password: hashedPassword,
    });

    console.log("Admin created ✅");
    process.exit();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

createAdmin();