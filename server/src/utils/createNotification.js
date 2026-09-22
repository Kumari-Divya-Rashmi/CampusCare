import Notification from "../models/Notification.js";

import {
  getIO,
} from "../socket/socket.js";

const createNotification =
  async ({
    recipient,
    type,
    title,
    message,
    complaint = null,
  }) => {
    try {
      const notification =
        await Notification.create({
          recipient,
          type,
          title,
          message,
          complaint,
        });

      const populatedNotification =
        await Notification.findById(
          notification._id
        ).populate(
          "complaint",
          "title status"
        );

      try {
        const io =
          getIO();

        if (io) {
          io.to(
            `user:${recipient.toString()}`
          ).emit(
            "notification:new",
            populatedNotification
          );
        }
      } catch (
        socketError
      ) {
        console.error(
          "Real-time notification error:",
          socketError
        );
      }

      return populatedNotification;
    } catch (error) {
      console.error(
        "Notification creation error:",
        error
      );

      return null;
    }
  };

export default createNotification;