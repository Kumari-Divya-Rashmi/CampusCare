import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getAssignedComplaints,
  updateComplaintStatus,
} from "../services/staffService";

import StaffComplaintCard from "../components/StaffComplaintCard";

const StaffDashboard = () => {
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

  const [success, setSuccess] =
    useState("");

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAssignedComplaints();

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

  const handleStatusUpdate =
    async (
      complaintId,
      status
    ) => {
      try {
        setError("");
        setSuccess("");

        const data =
          await updateComplaintStatus(
            complaintId,
            status
          );

        setSuccess(
          data.message
        );

        await loadComplaints();
      } catch (error) {
        setError(error.message);
      }
    };

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

  const assignedCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "assigned"
    ).length;

  const inProgressCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "in-progress"
    ).length;

  const resolvedCount =
    complaints.filter(
      (complaint) =>
        complaint.status ===
        "resolved"
    ).length;

  return (
    <div className="staff-dashboard-page">
      <div className="staff-dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>
              CampusCare Staff
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

        <section className="staff-heading">
          <div>
            <h2>
              Assigned Complaints
            </h2>

            <p>
              Manage maintenance
              issues assigned to you.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>
              Total Assigned
            </span>

            <strong>
              {complaints.length}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Waiting
            </span>

            <strong>
              {assignedCount}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              In Progress
            </span>

            <strong>
              {inProgressCount}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Resolved
            </span>

            <strong>
              {resolvedCount}
            </strong>
          </div>
        </section>

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

        {loading ? (
          <div className="dashboard-message">
            Loading assigned complaints...
          </div>
        ) : complaints.length ===
          0 ? (
          <div className="empty-state">
            <h3>
              No complaints assigned
            </h3>

            <p>
              New assignments will
              appear here.
            </p>
          </div>
        ) : (
          <section className="staff-complaints-list">
            {complaints.map(
              (complaint) => (
                <StaffComplaintCard
                  key={
                    complaint._id
                  }
                  complaint={
                    complaint
                  }
                  onStatusUpdate={
                    handleStatusUpdate
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

export default StaffDashboard;