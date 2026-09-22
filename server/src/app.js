import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";

import {
  env,
} from "./config/env.js";

import {
  corsOptions,
} from "./config/cors.js";

import authRoutes from "./routes/authRoutes.js";
import accessRoutes from "./routes/accessRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import {
  apiRateLimiter,
} from "./middleware/rateLimitMiddleware.js";

import {
  notFoundHandler,
  errorHandler,
} from "./middleware/errorMiddleware.js";

const app = express();

app.disable(
  "x-powered-by"
);

if (
  env.nodeEnv ===
  "production"
) {
  app.set(
    "trust proxy",
    1
  );
}

app.use(
  helmet()
);

app.use(
  cors(
    corsOptions
  )
);

app.use(
  compression()
);

app.use(
  hpp()
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "1mb",
  })
);

app.use(
  "/api",
  apiRateLimiter
);

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,

      message:
        "CampusCare API is running",
    });
  }
);

app.get(
  "/api/health",
  (req, res) => {
    const databaseConnected =
      mongoose.connection
        .readyState === 1;

    const healthy =
      databaseConnected;

    res
      .status(
        healthy
          ? 200
          : 503
      )
      .json({
        success:
          healthy,

        message:
          healthy
            ? "CampusCare backend is healthy"
            : "CampusCare backend is not ready",

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
  notFoundHandler
);

app.use(
  errorHandler
);

export default app;