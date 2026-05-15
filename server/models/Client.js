import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const clientSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    surname: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email address"],
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔥 Hide password by default
    },

    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },

    // ================= STORAGE TRACKING =================
    storageUsed: {
      type: Number,
      default: 0, // in MB
      min: 0,
    },

    storageLimit: {
      type: Number,
      default: 5000, // 5GB default
      min: 0,
    },

    // ================= USAGE TRACKING =================
    totalGalleries: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalMedia: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ================= SUBSCRIPTION =================
    subscription: {
      plan: {
        type: String,
        enum: ["free", "starter", "pro", "studio"],
        default: "free",
      },

      status: {
        type: String,
        enum: ["active", "inactive", "expired"],
        default: "active",
      },

      expiresAt: {
        type: Date,
      },
    },

    // ================= ACTIVITY TRACKING =================
    lastLogin: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ================= HASH PASSWORD =================
clientSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ================= MATCH PASSWORD =================
clientSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

export default mongoose.model("Client", clientSchema);