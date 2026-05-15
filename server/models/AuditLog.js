import mongoose from "mongoose";

const auditSchema = new mongoose.Schema({
  adminId: String,
  action: String,
  targetId: String,
  metadata: Object,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("AuditLog", auditSchema);