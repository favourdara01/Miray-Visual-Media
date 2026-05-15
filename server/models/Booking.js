import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    service: String,
    date: String,
    message: String,
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }

);



export default mongoose.model("Booking", bookingSchema);