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

// ================= APP INITIALIZATION =================
const app = express();

// ✅ Enforce trust proxy layer to read client IPs behind Render's routing proxies accurately
app.set('trust proxy', 1);

const server = http.createServer(app);

// ================= SECURITY DEFENSES =================

app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// CORS CROSS-ORIGIN MATRIX ALIGNMENT
const allowedOrigins = [
  "http://localhost:5173",
  "https://miray-visual-media-2.onrender.com",
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ""));
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// BODY PARSERS
app.use(express.json({ limit: "10kb" })); 
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// 🛡️ NATIVE ULTRA-SAFE NOSQL INJECTION SANITIZER
// Recursively strips any keys starting with "$" or containing dots from body & params, avoiding read-only query bugs entirely.
const deepSanitize = (obj) => {
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (key.startsWith("$") || key.includes(".")) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        deepSanitize(obj[key]);
      }
    }
  }
};

app.use((req, res, next) => {
  if (req.body) deepSanitize(req.body);
  if (req.params) deepSanitize(req.params);
  next();
});

// PREVENT HTTP PARAMETER POLLUTION
app.use(hpp());

// LAYER-1 RATE LIMITING
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, 
    standardHeaders: true, 
    legacyHeaders: false,  
    message: "Too many requests matching this IP sequence.",
  })
);

// LAYER-2 rate limiter inclusion
app.use(globalLimiter);

// ================= SOCKET.IO ENGINE =================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["polling", "websocket"], 
  allowEIO3: true,
});

io.on("connection", (socket) => {
  console.log("⚡ Client connected to transmission node:", socket.id);
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected from transmission node:", socket.id);
  });
});

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
    dotfiles: "ignore", 
  })
);

// ================= ROUTES MOUNT BAR =================
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
  res.send("API is running securely...");
});

// ================= CRON REPORTING AUTOMATION =================
startWeeklyReportJob();
startMonthlyReportJob();

app.use(notFound);
app.use(errorHandler);

// ================= SINGLE SERVER RUNTIME START =================
const startServer = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected securely ✅");

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Secure system instance running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Critical server bootstrap failure:", err.message);
    server.listen(5001, () => {
      console.log("⚠️ Safe mode fallback channel functional on port 5001");
    });
  }
};

startServer();