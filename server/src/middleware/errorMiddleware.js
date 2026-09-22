import multer from "multer";

import {
  env,
} from "../config/env.js";

export const notFoundHandler =
  (
    req,
    res,
    next
  ) => {
    const error =
      new Error(
        `Route not found: ${req.method} ${req.originalUrl}`
      );

    error.statusCode =
      404;

    next(error);
  };

export const errorHandler =
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Server error:",
      error
    );

    if (
      error instanceof
      multer.MulterError
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            error.code ===
            "LIMIT_FILE_SIZE"
              ? "Image must be smaller than 5 MB"
              : error.message,
        });
    }

    if (
      error.message ===
      "Only JPG, PNG and WEBP images are allowed"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message,
        });
    }

    if (
      error.message ===
      "Not allowed by CORS"
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "Origin is not allowed to access this API",
        });
    }

    if (
      error instanceof
        SyntaxError &&
      error.status === 400 &&
      "body" in error
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid JSON request body",
        });
    }

    if (
      error.name ===
      "CastError"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid resource identifier",
        });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      const messages =
        Object.values(
          error.errors
        ).map(
          (item) =>
            item.message
        );

      return res
        .status(400)
        .json({
          success: false,

          message:
            messages.join(
              ", "
            ),
        });
    }

    if (
      error.code ===
      11000
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "A resource with this value already exists",
        });
    }

    const statusCode =
      error.statusCode ||
      error.status ||
      500;

    const isProduction =
      env.nodeEnv ===
      "production";

    return res
      .status(statusCode)
      .json({
        success: false,

        message:
          statusCode ===
            500 &&
          isProduction
            ? "Internal server error"
            : error.message ||
              "Internal server error",

        ...(!isProduction &&
        statusCode === 500
          ? {
              stack:
                error.stack,
            }
          : {}),
      });
  };