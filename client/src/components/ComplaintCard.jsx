import { Link } from "react-router-dom";

const ComplaintCard = ({ complaint }) => {
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

  const createdDate = new Date(
    complaint.createdAt
  ).toLocaleDateString();

  return (
    <article className="complaint-item">
      <div className="complaint-item-header">
        <div>
          <h3>{complaint.title}</h3>

          <span className="complaint-date">
            Reported: {createdDate}
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

      <div className="complaint-details">
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

        <div>
          <strong>
            Assigned To
          </strong>

          <span>
            {complaint.assignedTo
              ?.name ||
              "Not assigned yet"}
          </span>
        </div>
      </div>

      <Link
        to={`/student/complaints/${complaint._id}`}
        className="details-link"
      >
        View Details
      </Link>
    </article>
  );
};

export default ComplaintCard;