import mongoose from "mongoose";

import Complaint from "../models/Complaint.js";
import Feedback from "../models/Feedback.js";

import recordActivity from "../utils/recordActivity.js";

export const submitComplaintFeedback =
  async (req, res) => {
    try {
      const { complaintId } =
        req.params;

      const {
        rating,
        comment = "",
      } = req.body;

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

      const numericRating =
        Number(rating);

      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 1 and 5",
        });
      }

      const cleanComment =
        typeof comment === "string"
          ? comment.trim()
          : "";

      if (
        cleanComment.length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Feedback cannot exceed 1000 characters",
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
        complaint.createdBy.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only review your own complaint",
        });
      }

      if (
        complaint.status !==
        "resolved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Feedback can only be submitted after the complaint is resolved",
        });
      }

      const existingFeedback =
        await Feedback.findOne({
          complaint: complaintId,
        });

      if (existingFeedback) {
        return res.status(409).json({
          success: false,
          message:
            "Feedback has already been submitted for this complaint",
        });
      }

      const feedback =
        await Feedback.create({
          complaint: complaintId,
          student: req.user._id,
          rating: numericRating,
          comment: cleanComment,
        });

      await recordActivity({
        complaintId,
        actorId: req.user._id,
        action:
          "feedback_submitted",
        message:
          `Submitted ${numericRating}-star feedback`,
      });

      const populatedFeedback =
        await Feedback.findById(
          feedback._id
        ).populate(
          "student",
          "name email department"
        );

      res.status(201).json({
        success: true,

        message:
          "Feedback submitted successfully",

        feedback:
          populatedFeedback,
      });
    } catch (error) {
      console.error(
        "Submit feedback error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while submitting feedback",
      });
    }
  };