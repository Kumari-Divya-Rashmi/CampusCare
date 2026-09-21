import mongoose from "mongoose";

import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

import recordActivity from "../utils/recordActivity.js";
import createNotification from "../utils/createNotification.js";

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

export const getAllComplaints =
  async (req, res) => {
    try {
      const {
        status,
        category,
        priority,
        search = "",
        sort = "latest",
        page = "1",
        limit = "6",
      } = req.query;

      const validStatuses = [
        "pending",
        "assigned",
        "in-progress",
        "resolved",
      ];

      const validCategories = [
        "wifi",
        "electricity",
        "water",
        "hostel",
        "classroom",
        "lab",
        "cleanliness",
        "other",
      ];

      const validPriorities = [
        "low",
        "medium",
        "high",
        "critical",
      ];

      if (
        status &&
        !validStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status filter",
        });
      }

      if (
        category &&
        !validCategories.includes(
          category
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category filter",
        });
      }

      if (
        priority &&
        !validPriorities.includes(
          priority
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid priority filter",
        });
      }

      const pageNumber =
        Math.max(
          Number.parseInt(
            page,
            10
          ) || 1,
          1
        );

      const pageSize =
        Math.min(
          Math.max(
            Number.parseInt(
              limit,
              10
            ) || 6,
            1
          ),
          50
        );

      const filter = {};

      if (status) {
        filter.status = status;
      }

      if (category) {
        filter.category =
          category;
      }

      if (priority) {
        filter.priority =
          priority;
      }

      const trimmedSearch =
        search.trim();

      if (trimmedSearch) {
        const safeSearch =
          escapeRegex(
            trimmedSearch
          );

        filter.$or = [
          {
            title: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },

          {
            description: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },

          {
            location: {
              $regex:
                safeSearch,
              $options: "i",
            },
          },
        ];
      }

      const sortOption =
        sort === "oldest"
          ? {
              createdAt: 1,
            }
          : {
              createdAt: -1,
            };

      const totalComplaints =
        await Complaint.countDocuments(
          filter
        );

      const totalPages =
        Math.ceil(
          totalComplaints /
            pageSize
        );

      const complaints =
        await Complaint.find(
          filter
        )
          .populate(
            "createdBy",
            "name email department"
          )
          .populate(
            "assignedTo",
            "name email department"
          )
          .sort(sortOption)
          .skip(
            (pageNumber - 1) *
              pageSize
          )
          .limit(pageSize);

      res.status(200).json({
        success: true,

        complaints,

        pagination: {
          total:
            totalComplaints,

          page:
            pageNumber,

          limit:
            pageSize,

          totalPages,

          hasPrevious:
            pageNumber > 1,

          hasNext:
            pageNumber <
            totalPages,
        },
      });
    } catch (error) {
      console.error(
        "Get all complaints error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while fetching complaints",
      });
    }
  };

export const getStaffUsers =
  async (req, res) => {
    try {
      const staff =
        await User.find({
          role: "staff",
        })
          .select(
            "name email department role"
          )
          .sort({
            name: 1,
          });

      res.status(200).json({
        success: true,
        count: staff.length,
        staff,
      });
    } catch (error) {
      console.error(
        "Get staff users error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while fetching staff",
      });
    }
  };

export const assignComplaint =
  async (req, res) => {
    try {
      const {
        complaintId,
      } = req.params;

      const {
        staffId,
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

      if (
        !mongoose.Types.ObjectId.isValid(
          staffId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid staff ID",
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

      const staffMember =
        await User.findOne({
          _id: staffId,
          role: "staff",
        });

      if (!staffMember) {
        return res.status(400).json({
          success: false,
          message:
            "Selected user is not a valid staff member",
        });
      }

      if (
        complaint.status ===
        "resolved"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Resolved complaints cannot be reassigned",
        });
      }

      complaint.assignedTo =
        staffMember._id;

      complaint.status =
        "assigned";

      await complaint.save();

      await recordActivity({
        complaintId:
          complaint._id,

        actorId:
          req.user._id,

        action:
          "assigned",

        message:
          `Assigned complaint to ${staffMember.name}`,
      });

      await Promise.all([
        createNotification({
          recipient:
            staffMember._id,

          type:
            "complaint_assigned",

          title:
            "New complaint assigned",

          message:
            `You have been assigned "${complaint.title}".`,

          complaint:
            complaint._id,
        }),

        createNotification({
          recipient:
            complaint.createdBy,

          type:
            "complaint_assigned",

          title:
            "Complaint assigned",

          message:
            `Your complaint "${complaint.title}" has been assigned to ${staffMember.name}.`,

          complaint:
            complaint._id,
        }),
      ]);

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
          "Complaint assigned successfully",

        complaint:
          updatedComplaint,
      });
    } catch (error) {
      console.error(
        "Assign complaint error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while assigning complaint",
      });
    }
  };