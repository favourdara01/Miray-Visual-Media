import rateLimit from "express-rate-limit";

// 🌍 GLOBAL LIMIT
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests",
});

// 👤 USER/IP LIMIT
export const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many requests per minute",
});