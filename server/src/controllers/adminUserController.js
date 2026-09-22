import mongoose from "mongoose";

import User from "../models/User.js";
import Complaint from "../models/Complaint.js";

import {
  disconnectUserSockets,
} from "../socket/socket.js";

const escapeRegex = (
  value
) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

export const getAdminUsers =
  async (req, res) => {
    try {
      const {
        search = "",
        role = "",
        status = "",
        page = "1",
        limit = "10",
      } = req.query;

      const validRoles = [
        "student",
        "staff",
        "admin",
      ];

      const validStatuses = [
        "active",
        "inactive",
      ];

      if (
        role &&
        !validRoles.includes(
          role
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid role filter",
          });
      }

      if (
        status &&
        !validStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid status filter",
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
            ) || 10,
            1
          ),
          50
        );

      const filter = {};

      if (role) {
        filter.role = role;
      }

      if (
        status === "active"
      ) {
        filter.isActive = {
          $ne: false,
        };
      }

      if (
        status === "inactive"
      ) {
        filter.isActive =
          false;
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
            name: {
              $regex:
                safeSearch,

              $options: "i",
            },
          },

          {
            email: {
              $regex:
                safeSearch,

              $options: "i",
            },
          },

          {
            department: {
              $regex:
                safeSearch,

              $options: "i",
            },
          },
        ];
      }

      const totalUsers =
        await User.countDocuments(
          filter
        );

      const totalPages =
        Math.ceil(
          totalUsers /
            pageSize
        );

      const users =
        await User.find(
          filter
        )
          .select(
            "name email role department isActive createdAt updatedAt"
          )
          .sort({
            createdAt: -1,
          })
          .skip(
            (pageNumber - 1) *
              pageSize
          )
          .limit(
            pageSize
          );

      res.status(200).json({
        success: true,

        users,

        pagination: {
          total:
            totalUsers,

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
        "Get users error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Server error while loading users",
      });
    }
  };

export const createStaffUser =
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        department,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Name, email and password are required",
          });
      }

      if (
        password.length < 6
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Password must contain at least 6 characters",
          });
      }

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const existingUser =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (existingUser) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "User with this email already exists",
          });
      }

      const staffUser =
        await User.create({
          name,

          email:
            normalizedEmail,

          password,

          department,

          role: "staff",

          isActive: true,
        });

      res.status(201).json({
        success: true,

        message:
          "Staff account created successfully",

        user: {
          id:
            staffUser._id,

          name:
            staffUser.name,

          email:
            staffUser.email,

          role:
            staffUser.role,

          department:
            staffUser.department,

          isActive:
            staffUser.isActive,
        },
      });
    } catch (error) {
      console.error(
        "Create staff error:",
        error
      );

      if (
        error.code === 11000
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "User with this email already exists",
          });
      }

      res.status(500).json({
        success: false,

        message:
          "Server error while creating staff account",
      });
    }
  };

export const updateUserStatus =
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;

      const {
        isActive,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid user ID",
          });
      }

      if (
        typeof isActive !==
        "boolean"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "isActive must be true or false",
          });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User not found",
          });
      }

      if (
        user.role === "admin"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Admin accounts cannot be activated or deactivated from this page",
          });
      }

      user.isActive =
        isActive;

      await user.save();

      if (!isActive) {
        disconnectUserSockets(
          user._id
        );
      }

      res.status(200).json({
        success: true,

        message: isActive
          ? "User activated successfully"
          : "User deactivated successfully",

        user: {
          id: user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          department:
            user.department,

          isActive:
            user.isActive,
        },
      });
    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Server error while updating user status",
      });
    }
  };

export const updateUserRole =
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;

      const {
        role,
      } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid user ID",
          });
      }

      const allowedRoles = [
        "student",
        "staff",
      ];

      if (
        !allowedRoles.includes(
          role
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Role must be student or staff",
          });
      }

      const user =
        await User.findById(
          userId
        );

      if (!user) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User not found",
          });
      }

      if (
        user.role === "admin"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Admin role cannot be changed from this page",
          });
      }

      if (
        user.role === role
      ) {
        return res
          .status(200)
          .json({
            success: true,

            message:
              "User already has this role",

            user,
          });
      }

      if (
        user.role ===
          "staff" &&
        role ===
          "student"
      ) {
        const activeAssignments =
          await Complaint.countDocuments(
            {
              assignedTo:
                user._id,

              status: {
                $in: [
                  "assigned",
                  "in-progress",
                ],
              },
            }
          );

        if (
          activeAssignments >
          0
        ) {
          return res
            .status(409)
            .json({
              success: false,

              message:
                "This staff member still has active assigned complaints. Reassign or resolve them before changing the role.",
            });
        }
      }

      user.role = role;

      await user.save();

      disconnectUserSockets(
        user._id
      );

      res.status(200).json({
        success: true,

        message:
          `User role changed to ${role} successfully`,

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          department:
            user.department,

          isActive:
            user.isActive,
        },
      });
    } catch (error) {
      console.error(
        "Update user role error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Server error while updating user role",
      });
    }
  };