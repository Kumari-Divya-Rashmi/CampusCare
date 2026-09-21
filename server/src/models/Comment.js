import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [
        1000,
        "Comment cannot exceed 1000 characters",
      ],
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({
  complaint: 1,
  createdAt: 1,
});

const Comment = mongoose.model(
  "Comment",
  commentSchema
);

export default Comment;