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
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

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

export default router;