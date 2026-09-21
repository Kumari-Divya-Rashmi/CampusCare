import Complaint from "../models/Complaint.js";

import cloudinary from "../config/cloudinary.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import recordActivity from "../utils/recordActivity.js";

export const createComplaint =
  async (req, res) => {
    let uploadedPublicId = null;

    try {
      const {
        title,
        description,
        category,
        priority,
        location,
      } = req.body;

      if (
        !title ||
        !description ||
        !category ||
        !location
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, description, category and location are required",
        });
      }

      let evidenceImage = null;

      if (req.file) {
        const uploadedImage =
          await uploadToCloudinary(
            req.file.buffer
          );

        uploadedPublicId =
          uploadedImage.public_id;

        evidenceImage = {
          url:
            uploadedImage.secure_url,

          publicId:
            uploadedImage.public_id,
        };
      }

     const complaint =
  await Complaint.create({
    title,
    description,
    category,
    priority,
    location,
    evidenceImage,
    createdBy: req.user._id,
  });

await recordActivity({
  complaintId: complaint._id,
  actorId: req.user._id,
  action: "created",
  message: "Created the complaint",
});
      const populatedComplaint =
        await Complaint.findById(
          complaint._id
        ).populate(
          "createdBy",
          "name email department"
        );

      res.status(201).json({
        success: true,

        message:
          "Complaint created successfully",

        complaint:
          populatedComplaint,
      });
    } catch (error) {
      console.error(
        "Create complaint error:",
        error
      );

      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(
            uploadedPublicId
          );
        } catch (
          cleanupError
        ) {
          console.error(
            "Cloudinary cleanup error:",
            cleanupError
          );
        }
      }

      if (
        error.name ===
        "ValidationError"
      ) {
        const messages =
          Object.values(
            error.errors
          ).map(
            (item) =>
              item.message
          );

        return res
          .status(400)
          .json({
            success: false,
            message:
              messages.join(", "),
          });
      }

      res.status(500).json({
        success: false,
        message:
          "Server error while creating complaint",
      });
    }
  };

export const getMyComplaints = async (
  req,
  res
) => {
  try {
    const complaints =
      await Complaint.find({
        createdBy: req.user._id,
      })
        .populate(
          "assignedTo",
          "name email department"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error(
      "Get my complaints error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching complaints",
    });
  }
};