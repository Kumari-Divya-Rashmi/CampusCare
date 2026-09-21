import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import accessRoutes from "./routes/accessRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

const app = express();

connectDB();

app.use(
  cors({
    origin:
      "http://localhost:5173",
  })
);

app.use(
  express.json()
);

app.get(
  "/",
  (req, res) => {
    res.send(
      "CampusCare API is running"
    );
  }
);

app.get(
  "/api/health",
  (req, res) => {
    const databaseConnected =
      mongoose.connection
        .readyState === 1;

    res.status(200).json({
      success: true,

      message:
        "CampusCare backend is healthy",

      database:
        databaseConnected
          ? "connected"
          : "disconnected",
    });
  }
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/access",
  accessRoutes
);

app.use(
  "/api/complaints",
  complaintRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/staff",
  staffRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error?.name ===
      "MulterError"
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
      error?.message ===
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

    console.error(
      "Unhandled server error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Internal server error",
      });
  }
);

const PORT =
  process.env.PORT ||
  5000;

app.listen(
  PORT,
  () => {
    console.log(
      `CampusCare server running on port ${PORT}`
    );
  }
);