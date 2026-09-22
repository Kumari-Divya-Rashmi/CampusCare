import jwt from "jsonwebtoken";

import User from "../models/User.js";

import {
  env,
} from "../config/env.js";

export const protect =
  async (
    req,
    res,
    next
  ) => {
    try {
      const authHeader =
        req.headers
          .authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Not authorized. Authentication token missing.",
          });
      }

      const token =
        authHeader
          .slice(7)
          .trim();

      if (!token) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Not authorized. Authentication token missing.",
          });
      }

      const decoded =
        jwt.verify(
          token,
          env.jwtSecret,
          {
            issuer:
              "campuscare-api",

            audience:
              "campuscare-client",
          }
        );

      const user =
        await User.findById(
          decoded.userId
        );

      if (!user) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "User belonging to this token no longer exists",
          });
      }

      if (
        user.isActive ===
        false
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Your account has been deactivated",
          });
      }

      req.user = user;

      next();
    } catch (error) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Not authorized. Invalid or expired token.",
        });
    }
  };

export const authorizeRoles =
  (...allowedRoles) =>
  (
    req,
    res,
    next
  ) => {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Authentication required",
        });
    }

    if (
      !allowedRoles.includes(
        req.user.role
      )
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "You do not have permission to access this resource",
        });
    }

    next();
  };