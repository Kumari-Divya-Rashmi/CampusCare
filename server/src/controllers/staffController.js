import mongoose from "mongoose";

import Complaint from "../models/Complaint.js";

import recordActivity from "../utils/recordActivity.js";
import createNotification from "../utils/createNotification.js";

export const getAssignedComplaints =
  async (req, res) => {
    try {
      const complaints =
        await Complaint.find({
          assignedTo:
            req.user._id,
        })
          .populate(
            "createdBy",
            "name email department"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        success: true,

        count:
          complaints.length,

        complaints,
      });
    } catch (error) {
      console.error(
        "Get assigned complaints error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Server error while fetching assigned complaints",
      });
    }
  };

export const updateComplaintStatus =
  async (req, res) => {
    try {
      const {
        complaintId,
      } = req.params;

      const {
        status,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          complaintId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid complaint ID",
          });
      }

      const allowedStatuses = [
        "in-progress",
        "resolved",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid complaint status",
          });
      }

      const complaint =
        await Complaint.findOne({
          _id:
            complaintId,

          assignedTo:
            req.user._id,
        });

      if (!complaint) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Assigned complaint not found",
          });
      }

      const validTransitions = {
        assigned:
          "in-progress",

        "in-progress":
          "resolved",
      };

      const expectedNextStatus =
        validTransitions[
          complaint.status
        ];

      if (
        expectedNextStatus !==
        status
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              `Cannot change complaint from ${complaint.status} to ${status}`,
          });
      }

      const previousStatus =
        complaint.status;

      complaint.status =
        status;

      if (
        status ===
        "resolved"
      ) {
        complaint.resolvedAt =
          new Date();
      }

      await complaint.save();

      await recordActivity({
        complaintId:
          complaint._id,

        actorId:
          req.user._id,

        action:
          "status_changed",

        message:
          `Changed status from ${previousStatus} to ${status}`,
      });

      if (
        status ===
        "in-progress"
      ) {
        await createNotification({
          recipient:
            complaint.createdBy,

          type:
            "work_started",

          title:
            "Work started",

          message:
            `Staff has started working on "${complaint.title}".`,

          complaint:
            complaint._id,
        });
      }

      if (
        status ===
        "resolved"
      ) {
        await createNotification({
          recipient:
            complaint.createdBy,

          type:
            "complaint_resolved",

          title:
            "Complaint resolved",

          message:
            `Your complaint "${complaint.title}" has been marked as resolved.`,

          complaint:
            complaint._id,
        });
      }

      const updatedComplaint =
        await Complaint.findById(
          complaint._id
        )
          .populate(
            "createdBy",
            "name email department"
          )
          .populate(
            "assignedTo",
            "name email department"
          );

      res.status(200).json({
        success: true,

        message:
          "Complaint status updated successfully",

        complaint:
          updatedComplaint,
      });
    } catch (error) {
      console.error(
        "Update complaint status error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Server error while updating complaint status",
      });
    }
  };