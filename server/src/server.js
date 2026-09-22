import mongoose from "mongoose";

import {
  createServer,
} from "node:http";

import app from "./app.js";

import connectDB from "./config/db.js";

import {
  env,
  validateEnvironment,
} from "./config/env.js";

import {
  initializeSocket,
  getIO,
} from "./socket/socket.js";

const httpServer =
  createServer(app);

let shuttingDown =
  false;

const gracefulShutdown =
  (signal) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    console.log(
      `${signal} received. Shutting down CampusCare...`
    );

    const forceExitTimer =
      setTimeout(() => {
        console.error(
          "Forced shutdown after timeout."
        );

        process.exit(1);
      }, 10000);

    forceExitTimer.unref();

    const socketServer =
      getIO();

    if (socketServer) {
      socketServer.close();
    }

    httpServer.close(
      async () => {
        try {
          await mongoose.connection.close();

          console.log(
            "MongoDB connection closed."
          );

          console.log(
            "CampusCare shutdown complete."
          );

          process.exit(0);
        } catch (error) {
          console.error(
            "Shutdown error:",
            error
          );

          process.exit(1);
        }
      }
    );
  };

const startServer =
  async () => {
    validateEnvironment();

    await connectDB();

    initializeSocket(
      httpServer
    );

    httpServer.listen(
      env.port,
      "0.0.0.0",
      () => {
        console.log(
          `CampusCare server running on port ${env.port}`
        );

        console.log(
          `Environment: ${env.nodeEnv}`
        );

        console.log(
          `Allowed origins: ${env.allowedOrigins.join(
            ", "
          )}`
        );
      }
    );
  };

process.on(
  "SIGINT",
  () => {
    gracefulShutdown(
      "SIGINT"
    );
  }
);

process.on(
  "SIGTERM",
  () => {
    gracefulShutdown(
      "SIGTERM"
    );
  }
);

process.on(
  "unhandledRejection",
  (reason) => {
    console.error(
      "Unhandled promise rejection:",
      reason
    );

    gracefulShutdown(
      "unhandledRejection"
    );
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "Uncaught exception:",
      error
    );

    gracefulShutdown(
      "uncaughtException"
    );
  }
);

startServer().catch(
  (error) => {
    console.error(
      "CampusCare startup failed:",
      error
    );

    process.exit(1);
  }
);