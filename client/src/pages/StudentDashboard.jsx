import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getMyComplaints,
} from "../services/complaintService";

import ComplaintCard from "../components/ComplaintCard";

const StudentDashboard = () => {
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [complaints, setComplaints] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMyComplaints();

      setComplaints(
        data.complaints
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalComplaints =
    complaints.length;

  const pendingComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "pending"
    ).length;

  const inProgressComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "in-progress"
    ).length;

  const resolvedComplaints =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "resolved"
    ).length;

  return (
    <div className="student-dashboard">
      <div className="student-dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>
              CampusCare
            </h1>

            <p>
              Welcome, {user.name}
            </p>
          </div>

          <button
            className="logout-button"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>
        </header>

        <section className="student-actions">
          <div>
            <h2>
              My Complaints
            </h2>

            <p>
              Track the maintenance
              issues you have reported.
            </p>
          </div>

          <Link
            to="/student/complaints/new"
            className="new-complaint-button"
          >
            + Report Complaint
          </Link>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>
              Total
            </span>

            <strong>
              {totalComplaints}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Pending
            </span>

            <strong>
              {pendingComplaints}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              In Progress
            </span>

            <strong>
              {
                inProgressComplaints
              }
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Resolved
            </span>

            <strong>
              {resolvedComplaints}
            </strong>
          </div>
        </section>

        {loading && (
          <div className="dashboard-message">
            Loading your complaints...
          </div>
        )}

        {!loading && error && (
          <div className="error-message">
            {error}

            <button
              className="retry-button"
              onClick={
                loadComplaints
              }
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          complaints.length ===
            0 && (
            <div className="empty-state">
              <h3>
                No complaints yet
              </h3>

              <p>
                You haven't reported
                any campus problems.
              </p>

              <Link
                to="/student/complaints/new"
              >
                Report your first
                complaint
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          complaints.length > 0 && (
            <section className="complaints-list">
              {complaints.map(
                (complaint) => (
                  <ComplaintCard
                    key={
                      complaint._id
                    }
                    complaint={
                      complaint
                    }
                  />
                )
              )}
            </section>
          )}
      </div>
    </div>
  );
};

export default StudentDashboard;