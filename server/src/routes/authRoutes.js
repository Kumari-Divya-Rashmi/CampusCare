import express from "express";

import {
  registerUser,
  loginUser,
  getMyProfile,
} from "../controllers/authController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  authRateLimiter,
} from "../middleware/rateLimitMiddleware.js";

const router =
  express.Router();

router.post(
  "/register",
  authRateLimiter,
  registerUser
);

router.post(
  "/login",
  authRateLimiter,
  loginUser
);

router.get(
  "/me",
  protect,
  getMyProfile
);

export default router;