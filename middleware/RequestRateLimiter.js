import rateLimit from "express-rate-limit";
import Logger from "../utils/logger.js";
const logger = new Logger();
// Base options
const baseOptions = {
  windowMs: 15 * 60 * 1000, // 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.log(`[RateLimit] Blocked IP: ${req.ip}`, "info");
    res.status(options.statusCode).json(options.message);
  },
};

// General API limiter
export const apiLimiter = rateLimit({
  ...baseOptions,
  max: 1000,
  message: {
    status: 429,
    error: "Too many requests. Please try again later.",
  },
});

// Stricter limiter for login/auth routes
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: {
    status: 429,
    error: "Too many login attempts. Try again in a few minutes.",
  },
});

// Admin routes limiter
export const adminLimiter = rateLimit({
  ...baseOptions,
  max: 50,
  message: {
    status: 429,
    error: "Too many requests to admin API. Try again later.",
  },
});
