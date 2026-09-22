import express from "express";

import {
  getAllComplaints,
  getStaffUsers,
  assignComplaint,
} from "../controllers/adminController.js";

import {
  getAdminAnalytics,
} from "../controllers/analyticsController.js";

import {
  getAdminUsers,
  createStaffUser,
  updateUserStatus,
  updateUserRole,
} from "../controllers/adminUserController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.use(
  protect,
  authorizeRoles("admin")
);

router.get(
  "/analytics",
  getAdminAnalytics
);

router.get(
  "/complaints",
  getAllComplaints
);

router.get(
  "/staff",
  getStaffUsers
);

router.patch(
  "/complaints/:complaintId/assign",
  assignComplaint
);

router.get(
  "/users",
  getAdminUsers
);

router.post(
  "/users/staff",
  createStaffUser
);

router.patch(
  "/users/:userId/status",
  updateUserStatus
);

router.patch(
  "/users/:userId/role",
  updateUserRole
);

export default router;