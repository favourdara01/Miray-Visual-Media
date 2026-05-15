import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("RefreshToken", refreshTokenSchema);