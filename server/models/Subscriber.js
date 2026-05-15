import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: String,
});

export default mongoose.model("Subscriber", subscriberSchema);