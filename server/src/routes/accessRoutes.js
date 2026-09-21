import express from "express";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Student access granted",
      user: req.user.name,
    });
  }
);

router.get(
  "/staff",
  protect,
  authorizeRoles("staff"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Staff access granted",
      user: req.user.name,
    });
  }
);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
      user: req.user.name,
    });
  }
);

export default router;