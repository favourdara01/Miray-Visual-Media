import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cookieParser from "cookie-parser";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import mediaRoutes from "./routes/mediaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import analyticsRoutes from "./routes/analytics.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";

import { globalLimiter } from "./middleware/rateLimiter.js";

import {
  startWeeklyReportJob,
  startMonthlyReportJob,
} from "./jobs/reportjobs.js";

dotenv.config();

// ================= ENV CHECK =================
if (!process.env.MONGO_URI) throw new Error("MONGO_URI missing");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

// ================= APP =================
const app = express();
const server = http.createServer(app);

// ================= SECURITY =================
app.use(helmet());

// CORS (FIXED - SINGLE INSTANCE)
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// BODY PARSERS (ONLY ONCE)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// PREVENT PARAM POLLUTION
app.use(hpp());

// RATE LIMITING (ONLY ONCE)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again later.",
  })
);

app.use(globalLimiter);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ================= STATIC FILES =================
app.use(
  "/uploads",
  express.static("uploads", {
    index: false,
    redirect: false,
  })
);

// ================= ROUTES =================
app.use("/api/media", mediaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/subscribe", subscriberRoutes);
app.use("/api/portfolio", portfolioRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ================= CRON JOBS =================
startWeeklyReportJob();
startMonthlyReportJob();

// ================= ERROR HANDLERS =================
app.use(notFound);
app.use(errorHandler);

// ================= SINGLE SERVER START =================
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed:", err.message);

    console.log("🔁 Starting SAFE MODE...");

    server.listen(5001, () => {
      console.log("⚠️ Safe mode running on port 5001");
    });
  }
};

startServer();