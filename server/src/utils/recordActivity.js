import Activity from "../models/Activity.js";

const recordActivity = async ({
  complaintId,
  actorId,
  action,
  message,
}) => {
  try {
    return await Activity.create({
      complaint: complaintId,
      actor: actorId,
      action,
      message,
    });
  } catch (error) {
    console.error(
      "Activity logging error:",
      error
    );

    return null;
  }
};

export default recordActivity;