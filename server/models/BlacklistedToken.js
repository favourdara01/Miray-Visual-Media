import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
  token: String,
  expiresAt: Date,
});

export default mongoose.model("BlacklistedToken", blacklistedTokenSchema);