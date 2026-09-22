import rateLimit from "express-rate-limit";

import {
  env,
} from "../config/env.js";

export const apiRateLimiter =
  rateLimit({
    windowMs:
      env.rateLimitWindowMs,

    limit:
      env.rateLimitMax,

    standardHeaders: true,

    legacyHeaders: false,

    skip: (req) =>
      req.method ===
      "OPTIONS",

    message: {
      success: false,

      message:
        "Too many requests. Please try again later.",
    },
  });

export const authRateLimiter =
  rateLimit({
    windowMs:
      env.rateLimitWindowMs,

    limit:
      env.authRateLimitMax,

    standardHeaders: true,

    legacyHeaders: false,

    skip: (req) =>
      req.method ===
      "OPTIONS",

    message: {
      success: false,

      message:
        "Too many authentication attempts. Please try again later.",
    },
  });