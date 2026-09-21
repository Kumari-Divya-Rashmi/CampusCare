import express from "express";

import {
  createComplaint,
  getMyComplaints,
} from "../controllers/complaintController.js";

import {
  getComplaintDetails,
  addComplaintComment,
} from "../controllers/complaintInteractionController.js";

import {
  submitComplaintFeedback,
} from "../controllers/feedbackController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| STUDENT: GET OWN COMPLAINTS
|--------------------------------------------------------------------------
| GET /api/complaints/my
*/
router.get(
  "/my",
  protect,
  authorizeRoles("student"),
  getMyComplaints
);

/*
|--------------------------------------------------------------------------
| STUDENT: CREATE COMPLAINT
|--------------------------------------------------------------------------
| POST /api/complaints
|
| Supports optional evidence image upload.
| Form field name for image must be: image
*/
router.post(
  "/",
  protect,
  authorizeRoles("student"),
  upload.single("image"),
  createComplaint
);

/*
|--------------------------------------------------------------------------
| STUDENT / STAFF / ADMIN: GET COMPLAINT DETAILS
|--------------------------------------------------------------------------
| GET /api/complaints/:complaintId/details
|
| Access permission is checked inside getComplaintDetails.
*/
router.get(
  "/:complaintId/details",
  protect,
  getComplaintDetails
);

/*
|--------------------------------------------------------------------------
| STUDENT / STAFF / ADMIN: ADD COMMENT
|--------------------------------------------------------------------------
| POST /api/complaints/:complaintId/comments
|
| Access permission is checked inside addComplaintComment.
*/
router.post(
  "/:complaintId/comments",
  protect,
  addComplaintComment
);

/*
|--------------------------------------------------------------------------
| STUDENT: SUBMIT FEEDBACK
|--------------------------------------------------------------------------
| POST /api/complaints/:complaintId/feedback
|
| Only the student who created the resolved complaint
| can submit feedback.
*/
router.post(
  "/:complaintId/feedback",
  protect,
  authorizeRoles("student"),
  submitComplaintFeedback
);

export default router;