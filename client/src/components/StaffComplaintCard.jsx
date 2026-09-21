import { useState } from "react";
import { Link } from "react-router-dom";

const StaffComplaintCard = ({
  complaint,
  onStatusUpdate,
}) => {
  const [updating, setUpdating] =
    useState(false);

  const formatText = (value) => {
    if (!value) {
      return "";
    }

    return value
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const handleUpdate = async (
    newStatus
  ) => {
    try {
      setUpdating(true);

      await onStatusUpdate(
        complaint._id,
        newStatus
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <article className="staff-complaint-card">
      <div className="staff-complaint-header">
        <div>
          <h3>
            {complaint.title}
          </h3>

          <span>
            {new Date(
              complaint.createdAt
            ).toLocaleDateString()}
          </span>
        </div>

        <span
          className={`status-badge status-${complaint.status}`}
        >
          {formatText(
            complaint.status
          )}
        </span>
      </div>

      <p className="staff-description">
        {complaint.description}
      </p>

      {complaint.evidenceImage?.url && (
        <div className="complaint-image-section">
          <a
            href={
              complaint.evidenceImage
                .url
            }
            target="_blank"
            rel="noreferrer"
          >
            <img
              src={
                complaint.evidenceImage
                  .url
              }
              alt="Complaint evidence"
              className="complaint-evidence-image"
            />
          </a>
        </div>
      )}

      <div className="staff-details-grid">
        <div>
          <strong>
            Reported By
          </strong>

          <span>
            {complaint.createdBy
              ?.name ||
              "Unknown"}
          </span>

          <small>
            {complaint.createdBy
              ?.department ||
              "Department not provided"}
          </small>
        </div>

        <div>
          <strong>Category</strong>

          <span>
            {formatText(
              complaint.category
            )}
          </span>
        </div>

        <div>
          <strong>Priority</strong>

          <span
            className={`priority-${complaint.priority}`}
          >
            {formatText(
              complaint.priority
            )}
          </span>
        </div>

        <div>
          <strong>Location</strong>

          <span>
            {complaint.location}
          </span>
        </div>
      </div>

      <div className="staff-action-section">
        {complaint.status ===
          "assigned" && (
          <button
            type="button"
            disabled={updating}
            onClick={() =>
              handleUpdate(
                "in-progress"
              )
            }
          >
            {updating
              ? "Updating..."
              : "Start Work"}
          </button>
        )}

        {complaint.status ===
          "in-progress" && (
          <button
            type="button"
            disabled={updating}
            onClick={() =>
              handleUpdate(
                "resolved"
              )
            }
          >
            {updating
              ? "Updating..."
              : "Mark Resolved"}
          </button>
        )}

        {complaint.status ===
          "resolved" && (
          <div className="resolved-message">
            Complaint Resolved
          </div>
        )}
      </div>

      <Link
        to={`/staff/complaints/${complaint._id}`}
        className="details-link"
      >
        View Details
      </Link>
    </article>
  );
};

export default StaffComplaintCard;