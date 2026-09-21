import Notification from "../models/Notification.js";

const createNotification = async ({
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

    return notification;
  } catch (error) {
    console.error(
      "Notification creation error:",
      error
    );

    return null;
  }
};

export default createNotification;