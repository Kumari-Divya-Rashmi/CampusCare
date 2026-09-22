import {
  io,
} from "socket.io-client";

import {
  API_BASE_URL,
} from "../config/api";

const SOCKET_URL =
  API_BASE_URL.replace(
    /\/api\/?$/,
    ""
  );

let socket = null;

export const connectSocket =
  () => {
    const token =
      localStorage.getItem(
        "campuscare_token"
      );

    if (!token) {
      return null;
    }

    if (socket) {
      if (
        !socket.connected
      ) {
        socket.connect();
      }

      return socket;
    }

    socket = io(
      SOCKET_URL,
      {
        auth: {
          token,
        },

        transports: [
          "websocket",
          "polling",
        ],

        reconnection: true,

        reconnectionAttempts:
          Infinity,

        reconnectionDelay:
          1000,

        reconnectionDelayMax:
          5000,
      }
    );

    return socket;
  };

export const disconnectSocket =
  () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

export const getSocket =
  () => {
    return socket;
  };