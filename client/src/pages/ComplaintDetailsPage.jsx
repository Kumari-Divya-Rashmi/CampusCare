import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  addComplaintComment,
  getComplaintDetails,
  submitComplaintFeedback,
} from "../services/complaintDetailsService";

const formatText = (value) => {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("-", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
};

const ComplaintDetailsPage = () => {
  const { complaintId } =
    useParams();

  const { user } = useAuth();

  const [complaint, setComplaint] =
    useState(null);

  const [comments, setComments] =
    useState([]);

  const [activities, setActivities] =
    useState([]);

  const [feedback, setFeedback] =
    useState(null);

  const [commentText, setCommentText] =
    useState("");

  const [rating, setRating] =
    useState(0);

  const [
    feedbackComment,
    setFeedbackComment,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [
    feedbackSubmitting,
    setFeedbackSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getComplaintDetails(
          complaintId
        );

      setComplaint(
        data.complaint
      );

      setComments(
        data.comments
      );

      setActivities(
        data.activities
      );

      setFeedback(
        data.feedback || null
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [complaintId]);

  const handleCommentSubmit =
    async (event) => {
      event.preventDefault();

      if (!commentText.trim()) {
        return;
      }

      try {
        setSubmitting(true);
        setError("");
        setSuccess("");

        const data =
          await addComplaintComment(
            complaintId,
            commentText
          );

        setSuccess(
          data.message
        );

        setCommentText("");

        await loadDetails();
      } catch (error) {
        setError(error.message);
      } finally {
        setSubmitting(false);
      }
    };

  const handleFeedbackSubmit =
    async (event) => {
      event.preventDefault();

      if (
        rating < 1 ||
        rating > 5
      ) {
        setError(
          "Please select a rating from 1 to 5 stars"
        );

        return;
      }

      try {
        setFeedbackSubmitting(
          true
        );

        setError("");
        setSuccess("");

        const data =
          await submitComplaintFeedback(
            complaintId,
            rating,
            feedbackComment
          );

        setSuccess(
          data.message
        );

        setRating(0);
        setFeedbackComment("");

        await loadDetails();
      } catch (error) {
        setError(error.message);
      } finally {
        setFeedbackSubmitting(
          false
        );
      }
    };

  const dashboardPath =
    user.role === "admin"
      ? "/admin"
      : user.role === "staff"
      ? "/staff"
      : "/student";

  if (loading) {
    return (
      <div className="center-page">
        Loading complaint...
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="center-page">
        <div>
          <h2>
            Unable to load complaint
          </h2>

          <p>{error}</p>

          <Link
            to={dashboardPath}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  return (
    <div className="complaint-details-page">
      <div className="complaint-details-container">
        <div className="details-page-top">
          <div>
            <h1>
              {complaint.title}
            </h1>

            <p>
              Complaint ID:{" "}
              {complaint._id}
            </p>
          </div>

          <Link
            to={dashboardPath}
            className="details-back-link"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <section className="details-card">
          <div className="details-title-row">
            <h2>
              Complaint Details
            </h2>

            <span
              className={`status-badge status-${complaint.status}`}
            >
              {formatText(
                complaint.status
              )}
            </span>
          </div>

          <p className="details-description">
            {
              complaint.description
            }
          </p>

          <div className="details-grid">
            <div>
              <strong>
                Category
              </strong>

              <span>
                {formatText(
                  complaint.category
                )}
              </span>
            </div>

            <div>
              <strong>
                Priority
              </strong>

              <span>
                {formatText(
                  complaint.priority
                )}
              </span>
            </div>

            <div>
              <strong>
                Location
              </strong>

              <span>
                {
                  complaint.location
                }
              </span>
            </div>

            <div>
              <strong>
                Reported By
              </strong>

              <span>
                {
                  complaint.createdBy
                    ?.name
                }
              </span>
            </div>

            <div>
              <strong>
                Department
              </strong>

              <span>
                {
                  complaint.createdBy
                    ?.department ||
                  "Not provided"
                }
              </span>
            </div>

            <div>
              <strong>
                Assigned Staff
              </strong>

              <span>
                {
                  complaint.assignedTo
                    ?.name ||
                  "Not assigned"
                }
              </span>
            </div>

            <div>
              <strong>
                Created
              </strong>

              <span>
                {new Date(
                  complaint.createdAt
                ).toLocaleString()}
              </span>
            </div>
          </div>

          {complaint
            .evidenceImage?.url && (
            <div className="details-evidence">
              <h3>
                Evidence Image
              </h3>

              <a
                href={
                  complaint
                    .evidenceImage
                    .url
                }
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={
                    complaint
                      .evidenceImage
                      .url
                  }
                  alt="Complaint evidence"
                />
              </a>
            </div>
          )}
        </section>

        {user.role !== "staff" && (
          <section className="details-card">
            <h2>
              Service Feedback
            </h2>

            {feedback ? (
              <div className="submitted-feedback">
                <div className="feedback-stars">
                  {"★".repeat(
                    feedback.rating
                  )}

                  <span>
                    {"★".repeat(
                      5 -
                        feedback.rating
                    )}
                  </span>
                </div>

                <strong>
                  {feedback.rating}/5
                </strong>

                {feedback.comment && (
                  <p>
                    "
                    {
                      feedback.comment
                    }
                    "
                  </p>
                )}

                <small>
                  Submitted by{" "}
                  {
                    feedback.student
                      ?.name
                  }{" "}
                  on{" "}
                  {new Date(
                    feedback.createdAt
                  ).toLocaleString()}
                </small>
              </div>
            ) : user.role ===
                "student" &&
              complaint.status ===
                "resolved" ? (
              <form
                className="feedback-form"
                onSubmit={
                  handleFeedbackSubmit
                }
              >
                <p>
                  How satisfied are
                  you with the
                  resolution?
                </p>

                <div className="star-picker">
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        className={
                          value <= rating
                            ? "star-button selected-star"
                            : "star-button"
                        }
                        onClick={() =>
                          setRating(
                            value
                          )
                        }
                        aria-label={`${value} star rating`}
                      >
                        ★
                      </button>
                    )
                  )}
                </div>

                <p className="selected-rating-text">
                  {rating > 0
                    ? `${rating}/5 selected`
                    : "Select a rating"}
                </p>

                <textarea
                  rows="4"
                  maxLength="1000"
                  value={
                    feedbackComment
                  }
                  onChange={(event) =>
                    setFeedbackComment(
                      event.target
                        .value
                    )
                  }
                  placeholder="Optional: Tell us about your experience..."
                />

                <button
                  type="submit"
                  disabled={
                    feedbackSubmitting ||
                    rating === 0
                  }
                >
                  {feedbackSubmitting
                    ? "Submitting..."
                    : "Submit Feedback"}
                </button>
              </form>
            ) : (
              <p className="details-empty-text">
                {user.role ===
                "admin"
                  ? "The student has not submitted feedback yet."
                  : "Feedback can be submitted after this complaint is resolved."}
              </p>
            )}
          </section>
        )}

        <section className="details-card">
          <h2>Comments</h2>

          {comments.length ===
          0 ? (
            <p className="details-empty-text">
              No comments yet.
            </p>
          ) : (
            <div className="comments-list">
              {comments.map(
                (comment) => (
                  <div
                    className="comment-item"
                    key={
                      comment._id
                    }
                  >
                    <div className="comment-header">
                      <strong>
                        {
                          comment
                            .author
                            ?.name
                        }
                      </strong>

                      <span className="comment-role">
                        {formatText(
                          comment
                            .author
                            ?.role
                        )}
                      </span>
                    </div>

                    <p>
                      {
                        comment.message
                      }
                    </p>

                    <small>
                      {new Date(
                        comment.createdAt
                      ).toLocaleString()}
                    </small>
                  </div>
                )
              )}
            </div>
          )}

          <form
            className="comment-form"
            onSubmit={
              handleCommentSubmit
            }
          >
            <textarea
              rows="4"
              maxLength="1000"
              value={commentText}
              onChange={(event) =>
                setCommentText(
                  event.target
                    .value
                )
              }
              placeholder="Write a comment..."
              required
            />

            <button
              type="submit"
              disabled={
                submitting ||
                !commentText.trim()
              }
            >
              {submitting
                ? "Posting..."
                : "Add Comment"}
            </button>
          </form>
        </section>

        <section className="details-card">
          <h2>
            Activity History
          </h2>

          {activities.length ===
          0 ? (
            <p className="details-empty-text">
              No activity history
              recorded yet.
            </p>
          ) : (
            <div className="activity-timeline">
              {activities.map(
                (activity) => (
                  <div
                    className="activity-item"
                    key={
                      activity._id
                    }
                  >
                    <div className="activity-dot" />

                    <div>
                      <strong>
                        {
                          activity
                            .actor
                            ?.name ||
                          "System"
                        }
                      </strong>

                      <p>
                        {
                          activity.message
                        }
                      </p>

                      <small>
                        {new Date(
                          activity.createdAt
                        ).toLocaleString()}
                      </small>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ComplaintDetailsPage;