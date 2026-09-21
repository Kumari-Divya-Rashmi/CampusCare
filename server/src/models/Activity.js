import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
  "created",
  "assigned",
  "status_changed",
  "commented",
  "feedback_submitted",
],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({
  complaint: 1,
  createdAt: 1,
});

const Activity = mongoose.model(
  "Activity",
  activitySchema
);

export default Activity;
