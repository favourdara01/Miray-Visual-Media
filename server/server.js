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

// 🛡️ SECURITY ADDITION: Prevent NoSQL Query Injection payloads
import mongoSanitize from "express-mongo-sanitize";

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

// 🛡️ SECURITY OVERHAUL: Configure Helmet without blocking Cloudinary images/videos
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://placehold.co"],
        mediaSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://assets.mixkit.co"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// CORS CROSS-ORIGIN MATRIX ALIGNMENT
const allowedOrigins = [
  "http://localhost:5173",
  "https://miray-visual-media-2.onrender.com",
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, "")); // Trim trailing slash safely
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // mobile apps / dev tools
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS parameters"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// BODY PARSERS
app.use(express.json({ limit: "10kb" })); // Caps memory payload bounds against DDoS flooding
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// 🛡️ SECURITY ADDITION: Wash JSON body payloads of MongoDB special operators ($ and .)
app.use(mongoSanitize());

// PREVENT HTTP PARAMETER POLLUTION
app.use(hpp());

// LAYER-1 RATE LIMITING
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    message: "Too many requests matching this IP sequence, please try again later.",
  })
);

// LAYER-2 rate limiter inclusion
app.use(globalLimiter);

// ================= SOCKET.IO ENGINE =================
const io = new Server(server, {
  cors: {
    // ✅ FIXED: Dynamically syncs websocket validation rules to use your allowed list array parameters
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

// Attach socket context securely to middleware loop pipes
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
    dotfiles: "ignore", // Stop requests from sniffing hidden platform properties
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

// ================= GLOBAL INTERCEPT ERROR HANDLERS =================
app.use(notFound);
app.use(errorHandler);

// ================= SINGLE SERVER RUNTIME START =================
const startServer = async () => {
  try {
    // Disable strict query parameters warning logs inside newer Mongoose compilation instances
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected securely ✅");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`🚀 Secure system instance running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Critical server bootstrap failure:", err.message);
    console.log("🔁 Initializing secure fallback safe mode protocols...");

    server.listen(5001, () => {
      console.log("⚠️ Safe mode fallback channel functional on port 5001");
    });
  }
};

startServer();