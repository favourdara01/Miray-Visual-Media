import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: String,
  userAgent: String,
  ip: String,
  refreshToken: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", sessionSchema);