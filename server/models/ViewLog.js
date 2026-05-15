import mongoose from "mongoose";

const viewLogSchema = new mongoose.Schema(
  {
    media: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
    },
    ip: String,
    location: String, // e.g Lagos, Nigeria
  },
  { timestamps: true }
);

export default mongoose.model("ViewLog", viewLogSchema);