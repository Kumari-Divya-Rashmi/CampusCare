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
  assignComplaint,
  getAdminComplaints,
  getStaffUsers,
} from "../services/adminService";

import AdminComplaintCard from "../components/AdminComplaintCard";

const AdminDashboard = () => {
  const {
    user,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  const [
    complaints,
    setComplaints,
  ] = useState([]);

  const [
    staff,
    setStaff,
  ] = useState([]);

  const [
    filters,
    setFilters,
  ] = useState({
    status: "",
    category: "",
    priority: "",
  });

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [
    sort,
    setSort,
  ] = useState("latest");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const loadComplaints =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminComplaints({
            ...filters,

            search:
              appliedSearch,

            sort,
            page,
            limit: 6,
          });

        setComplaints(
          data.complaints
        );

        setPagination(
          data.pagination
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

  const loadStaff =
    async () => {
      try {
        const data =
          await getStaffUsers();

        setStaff(
          data.staff
        );
      } catch (error) {
        setError(error.message);
      }
    };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [
    filters.status,
    filters.category,
    filters.priority,
    appliedSearch,
    sort,
    page,
  ]);

  const handleFilterChange =
    (event) => {
      setFilters(
        (current) => ({
          ...current,

          [event.target.name]:
            event.target.value,
        })
      );

      setPage(1);
    };

  const handleSearchSubmit =
    (event) => {
      event.preventDefault();

      setPage(1);

      setAppliedSearch(
        searchInput.trim()
      );
    };

  const handleClearFilters =
    () => {
      setFilters({
        status: "",
        category: "",
        priority: "",
      });

      setSearchInput("");
      setAppliedSearch("");
      setSort("latest");
      setPage(1);
    };

  const handleAssign =
    async (
      complaintId,
      staffId
    ) => {
      try {
        setError("");
        setSuccess("");

        const data =
          await assignComplaint(
            complaintId,
            staffId
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

  const pageNumbers =
    Array.from(
      {
        length:
          pagination.totalPages,
      },

      (_, index) =>
        index + 1
    );

  const firstResult =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) *
          pagination.limit +
        1;

  const lastResult =
    Math.min(
      pagination.page *
        pagination.limit,

      pagination.total
    );

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <header className="dashboard-header">
          <div>
            <h1>
              CampusCare Admin
            </h1>

            <p>
              Welcome,{" "}
              {user.name}
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

        <section className="admin-heading">
          <div>
            <h2>
              Complaint Management
            </h2>

            <p>
              Search, filter,
              assign and manage
              campus issues.
            </p>
          </div>

          <div>
            <Link
              to="/admin/analytics"
              className="details-link"
            >
              View Analytics
            </Link>
          </div>
        </section>

        <section className="admin-search-panel">
          <form
            className="admin-search-form"
            onSubmit={
              handleSearchSubmit
            }
          >
            <input
              type="text"
              value={
                searchInput
              }
              onChange={(
                event
              ) =>
                setSearchInput(
                  event.target
                    .value
                )
              }
              placeholder="Search title, description or location..."
            />

            <button type="submit">
              Search
            </button>
          </form>

          <button
            className="clear-filter-button"
            onClick={
              handleClearFilters
            }
          >
            Clear
          </button>
        </section>

        <section className="filter-panel">
          <select
            name="status"
            value={
              filters.status
            }
            onChange={
              handleFilterChange
            }
          >
            <option value="">
              All Statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="assigned">
              Assigned
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="resolved">
              Resolved
            </option>
          </select>

          <select
            name="category"
            value={
              filters.category
            }
            onChange={
              handleFilterChange
            }
          >
            <option value="">
              All Categories
            </option>

            <option value="wifi">
              Wi-Fi
            </option>

            <option value="electricity">
              Electricity
            </option>

            <option value="water">
              Water
            </option>

            <option value="hostel">
              Hostel
            </option>

            <option value="classroom">
              Classroom
            </option>

            <option value="lab">
              Lab
            </option>

            <option value="cleanliness">
              Cleanliness
            </option>

            <option value="other">
              Other
            </option>
          </select>

          <select
            name="priority"
            value={
              filters.priority
            }
            onChange={
              handleFilterChange
            }
          >
            <option value="">
              All Priorities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>

            <option value="critical">
              Critical
            </option>
          </select>

          <select
            value={sort}
            onChange={(
              event
            ) => {
              setSort(
                event.target
                  .value
              );

              setPage(1);
            }}
          >
            <option value="latest">
              Newest First
            </option>

            <option value="oldest">
              Oldest First
            </option>
          </select>
        </section>

        {appliedSearch && (
          <div className="active-search">
            Search results for:{" "}
            <strong>
              "
              {appliedSearch}
              "
            </strong>
          </div>
        )}

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
            Loading complaints...
          </div>
        ) : complaints.length ===
          0 ? (
          <div className="empty-state">
            <h3>
              No complaints found
            </h3>

            <p>
              Change the search
              or selected filters.
            </p>
          </div>
        ) : (
          <>
            <div className="result-summary">
              Showing{" "}
              {firstResult}–
              {lastResult} of{" "}
              {
                pagination.total
              }
            </div>

            <section className="admin-complaints-list">
              {complaints.map(
                (
                  complaint
                ) => (
                  <AdminComplaintCard
                    key={
                      complaint._id
                    }
                    complaint={
                      complaint
                    }
                    staff={
                      staff
                    }
                    onAssign={
                      handleAssign
                    }
                  />
                )
              )}
            </section>

            {pagination.totalPages >
              1 && (
              <nav className="pagination">
                <button
                  disabled={
                    !pagination.hasPrevious
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        current -
                        1
                    )
                  }
                >
                  Previous
                </button>

                <div className="page-number-group">
                  {pageNumbers.map(
                    (
                      pageNumber
                    ) => (
                      <button
                        key={
                          pageNumber
                        }
                        className={
                          pageNumber ===
                          pagination.page
                            ? "active-page"
                            : ""
                        }
                        onClick={() =>
                          setPage(
                            pageNumber
                          )
                        }
                      >
                        {
                          pageNumber
                        }
                      </button>
                    )
                  )}
                </div>

                <button
                  disabled={
                    !pagination.hasNext
                  }
                  onClick={() =>
                    setPage(
                      (
                        current
                      ) =>
                        current +
                        1
                    )
                  }
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;