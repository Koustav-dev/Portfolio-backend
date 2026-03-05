import rateLimit from "express-rate-limit";
import { sendError } from "../utils/response";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, "Too many requests. Please try again later.", 429),
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, "Too many contact requests. Please try again in an hour.", 429),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => sendError(res, "Too many login attempts.", 429),
});
