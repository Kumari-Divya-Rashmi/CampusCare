import { useState } from "react";
import { Link } from "react-router-dom";

const AdminComplaintCard = ({
  complaint,
  staff,
  onAssign,
}) => {
  const [
    selectedStaff,
    setSelectedStaff,
  ] = useState(
    complaint.assignedTo?._id || ""
  );

  const [assigning, setAssigning] =
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

  const handleAssignment =
    async () => {
      if (!selectedStaff) {
        return;
      }

      try {
        setAssigning(true);

        await onAssign(
          complaint._id,
          selectedStaff
        );
      } finally {
        setAssigning(false);
      }
    };

  return (
    <article className="admin-complaint-card">
      <div className="admin-complaint-top">
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

      <p className="complaint-description">
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

      <div className="admin-details-grid">
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

      {complaint.status !==
        "resolved" && (
        <div className="assignment-section">
          <select
            value={selectedStaff}
            onChange={(event) =>
              setSelectedStaff(
                event.target.value
              )
            }
          >
            <option value="">
              Select staff member
            </option>

            {staff.map(
              (member) => (
                <option
                  key={member._id}
                  value={member._id}
                >
                  {member.name}
                  {" — "}
                  {member.department ||
                    "No Department"}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={
              handleAssignment
            }
            disabled={
              !selectedStaff ||
              assigning
            }
          >
            {assigning
              ? "Assigning..."
              : complaint.assignedTo
              ? "Reassign"
              : "Assign"}
          </button>
        </div>
      )}

      {complaint.assignedTo && (
        <p className="currently-assigned">
          Assigned to:{" "}
          <strong>
            {
              complaint.assignedTo
                .name
            }
          </strong>
        </p>
      )}

      <Link
        to={`/admin/complaints/${complaint._id}`}
        className="details-link"
      >
        View Details
      </Link>
    </article>
  );
};

export default AdminComplaintCard;