import mongoose from "mongoose";

import Complaint from "../models/Complaint.js";
import Comment from "../models/Comment.js";
import Activity from "../models/Activity.js";
import Feedback from "../models/Feedback.js";

import canAccessComplaint from "../utils/canAccessComplaint.js";
import recordActivity from "../utils/recordActivity.js";

export const getComplaintDetails = async (
  req,
  res
) => {
  try {
    const { complaintId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        complaintId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const rawComplaint =
      await Complaint.findById(
        complaintId
      );

    if (!rawComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    if (
      !canAccessComplaint(
        req.user,
        rawComplaint
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view this complaint",
      });
    }

    const complaint =
      await Complaint.findById(
        complaintId
      )
        .populate(
          "createdBy",
          "name email department role"
        )
        .populate(
          "assignedTo",
          "name email department role"
        );

    const comments =
      await Comment.find({
        complaint: complaintId,
      })
        .populate(
          "author",
          "name email role department"
        )
        .sort({
          createdAt: 1,
        });

    const activities =
      await Activity.find({
        complaint: complaintId,
      })
        .populate(
          "actor",
          "name role"
        )
        .sort({
          createdAt: 1,
        });

    let feedback = null;

    if (
      req.user.role === "student" ||
      req.user.role === "admin"
    ) {
      feedback =
        await Feedback.findOne({
          complaint: complaintId,
        }).populate(
          "student",
          "name email department"
        );
    }

    res.status(200).json({
      success: true,
      complaint,
      comments,
      activities,
      feedback,
    });
  } catch (error) {
    console.error(
      "Get complaint details error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while loading complaint details",
    });
  }
};

export const addComplaintComment =
  async (req, res) => {
    try {
      const { complaintId } =
        req.params;

      const { message } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          complaintId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid complaint ID",
        });
      }

      if (
        !message ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Comment cannot be empty",
        });
      }

      if (
        message.trim().length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Comment cannot exceed 1000 characters",
        });
      }

      const complaint =
        await Complaint.findById(
          complaintId
        );

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message:
            "Complaint not found",
        });
      }

      if (
        !canAccessComplaint(
          req.user,
          complaint
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to comment on this complaint",
        });
      }

      const comment =
        await Comment.create({
          complaint: complaintId,
          author: req.user._id,
          message: message.trim(),
        });

      await recordActivity({
        complaintId,
        actorId: req.user._id,
        action: "commented",
        message: "Added a comment",
      });

      const populatedComment =
        await Comment.findById(
          comment._id
        ).populate(
          "author",
          "name email role department"
        );

      res.status(201).json({
        success: true,
        message:
          "Comment added successfully",
        comment:
          populatedComment,
      });
    } catch (error) {
      console.error(
        "Add comment error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while adding comment",
      });
    }
  };