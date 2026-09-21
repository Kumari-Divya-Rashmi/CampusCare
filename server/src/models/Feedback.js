import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      unique: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Feedback cannot exceed 1000 characters",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({
  student: 1,
  createdAt: -1,
});

const Feedback = mongoose.model(
  "Feedback",
  feedbackSchema
);

export default Feedback;