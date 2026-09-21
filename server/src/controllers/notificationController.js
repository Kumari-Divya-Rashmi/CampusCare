import mongoose from "mongoose";

import Notification from "../models/Notification.js";

export const getMyNotifications = async (
  req,
  res
) => {
  try {
    const requestedLimit =
      Number.parseInt(
        req.query.limit,
        10
      ) || 20;

    const limit = Math.min(
      Math.max(
        requestedLimit,
        1
      ),
      50
    );

    const [
      notifications,
      unreadCount,
    ] = await Promise.all([
      Notification.find({
        recipient: req.user._id,
      })
        .populate(
          "complaint",
          "title status"
        )
        .sort({
          createdAt: -1,
        })
        .limit(limit),

      Notification.countDocuments({
        recipient: req.user._id,
        isRead: false,
      }),
    ]);

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while loading notifications",
    });
  }
};

export const markNotificationRead =
  async (req, res) => {
    try {
      const {
        notificationId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          notificationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid notification ID",
        });
      }

      const notification =
        await Notification.findOne({
          _id: notificationId,
          recipient: req.user._id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt =
          new Date();

        await notification.save();
      }

      res.status(200).json({
        success: true,
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while updating notification",
      });
    }
  };

export const markAllNotificationsRead =
  async (req, res) => {
    try {
      const now = new Date();

      const result =
        await Notification.updateMany(
          {
            recipient:
              req.user._id,

            isRead: false,
          },
          {
            $set: {
              isRead: true,
              readAt: now,
            },
          }
        );

      res.status(200).json({
        success: true,

        message:
          "All notifications marked as read",

        updatedCount:
          result.modifiedCount,
      });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while updating notifications",
      });
    }
  };