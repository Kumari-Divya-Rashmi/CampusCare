import {
  Server,
} from "socket.io";

import jwt from "jsonwebtoken";

import User from "../models/User.js";

import {
  env,
} from "../config/env.js";

import {
  socketCorsOptions,
} from "../config/cors.js";

let io = null;

export const initializeSocket =
  (httpServer) => {
    io = new Server(
      httpServer,
      {
        cors:
          socketCorsOptions,

        connectionStateRecovery:
          {
            maxDisconnectionDuration:
              2 *
              60 *
              1000,

            skipMiddlewares:
              false,
          },
      }
    );

    io.use(
      async (
        socket,
        next
      ) => {
        try {
          const token =
            socket.handshake
              .auth?.token;

          if (!token) {
            return next(
              new Error(
                "Authentication token missing"
              )
            );
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
            ).select(
              "_id name role isActive"
            );

          if (!user) {
            return next(
              new Error(
                "User not found"
              )
            );
          }

          if (
            user.isActive ===
            false
          ) {
            return next(
              new Error(
                "Account has been deactivated"
              )
            );
          }

          socket.user =
            user;

          next();
        } catch (error) {
          return next(
            new Error(
              "Invalid or expired token"
            )
          );
        }
      }
    );

    io.on(
      "connection",
      (socket) => {
        const userId =
          socket.user._id.toString();

        const userRoom =
          `user:${userId}`;

        socket.join(
          userRoom
        );

        console.log(
          `Socket connected: ${userId}`
        );

        socket.on(
          "disconnect",
          () => {
            console.log(
              `Socket disconnected: ${userId}`
            );
          }
        );
      }
    );

    return io;
  };

export const getIO =
  () => {
    return io;
  };

export const disconnectUserSockets =
  (userId) => {
    if (!io) {
      return;
    }

    const room =
      `user:${userId.toString()}`;

    io.in(room)
      .disconnectSockets(
        true
      );
  };