import express from "express";

import {
  getAssignedComplaints,
  updateComplaintStatus,
} from "../controllers/staffController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(
  protect,
  authorizeRoles("staff")
);

router.get(
  "/complaints",
  getAssignedComplaints
);

router.patch(
  "/complaints/:complaintId/status",
  updateComplaintStatus
);

export default router;