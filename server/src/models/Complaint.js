import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Complaint title is required"],
      trim: true,
      minlength: [5, "Title must contain at least 5 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Complaint description is required"],
      trim: true,
      minlength: [
        10,
        "Description must contain at least 10 characters",
      ],
      maxlength: [
        1000,
        "Description cannot exceed 1000 characters",
      ],
    },

    category: {
      type: String,
      required: [true, "Complaint category is required"],
      enum: [
        "wifi",
        "electricity",
        "water",
        "hostel",
        "classroom",
        "lab",
        "cleanliness",
        "other",
      ],
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in-progress",
        "resolved",
      ],
      default: "pending",
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    evidenceImage: {
   type: new mongoose.Schema(
    {
      url: {
        type: String,
        required: true,
      },

      publicId: {
        type: String,
        required: true,
      },
    },
    {
      _id: false,
    }
   ),

    default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
complaintSchema.index({
  createdBy: 1,
  createdAt: -1,
});

complaintSchema.index({
  assignedTo: 1,
  status: 1,
  createdAt: -1,
});

complaintSchema.index({
  status: 1,
  category: 1,
  priority: 1,
  createdAt: -1,
});

const Complaint = mongoose.model(
  "Complaint",
  complaintSchema
);

export default Complaint;