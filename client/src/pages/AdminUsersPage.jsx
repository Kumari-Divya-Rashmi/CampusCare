import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  createStaffUser,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/adminUserService";

import "./AdminUsersPage.css";

const AdminUsersPage = () => {
  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

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
    limit: 10,
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

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    actionUserId,
    setActionUserId,
  ] = useState("");

  const [
    staffForm,
    setStaffForm,
  ] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const loadUsers =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminUsers({
            search:
              appliedSearch,

            role:
              roleFilter,

            status:
              statusFilter,

            page,

            limit: 10,
          });

        setUsers(
          data.users
        );

        setPagination(
          data.pagination
        );
      } catch (error) {
        setError(
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadUsers();
  }, [
    appliedSearch,
    roleFilter,
    statusFilter,
    page,
  ]);

  const handleStaffFormChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setStaffForm(
        (current) => ({
          ...current,

          [name]:
            value,
        })
      );
    };

  const handleCreateStaff =
    async (event) => {
      event.preventDefault();

      try {
        setCreating(true);
        setError("");
        setSuccess("");

        const data =
          await createStaffUser(
            staffForm
          );

        setSuccess(
          data.message
        );

        setStaffForm({
          name: "",
          email: "",
          password: "",
          department: "",
        });

        setPage(1);

        await loadUsers();
      } catch (error) {
        setError(
          error.message
        );
      } finally {
        setCreating(false);
      }
    };

  const handleSearch =
    (event) => {
      event.preventDefault();

      setPage(1);

      setAppliedSearch(
        searchInput.trim()
      );
    };

  const handleClear =
    () => {
      setSearchInput("");
      setAppliedSearch("");
      setRoleFilter("");
      setStatusFilter("");
      setPage(1);
    };

  const handleStatusChange =
    async (
      user
    ) => {
      const currentlyActive =
        user.isActive !==
        false;

      try {
        setActionUserId(
          user._id
        );

        setError("");
        setSuccess("");

        const data =
          await updateUserStatus(
            user._id,
            !currentlyActive
          );

        setSuccess(
          data.message
        );

        await loadUsers();
      } catch (error) {
        setError(
          error.message
        );
      } finally {
        setActionUserId(
          ""
        );
      }
    };

  const handleRoleChange =
    async (
      userId,
      role
    ) => {
      try {
        setActionUserId(
          userId
        );

        setError("");
        setSuccess("");

        const data =
          await updateUserRole(
            userId,
            role
          );

        setSuccess(
          data.message
        );

        await loadUsers();
      } catch (error) {
        setError(
          error.message
        );
      } finally {
        setActionUserId(
          ""
        );
      }
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

  return (
    <div className="admin-users-page">
      <div className="admin-users-container">
        <header className="admin-users-header">
          <div>
            <h1>
              User Management
            </h1>

            <p>
              Manage students,
              staff accounts and
              user access.
            </p>
          </div>

          <Link
            to="/admin"
            className="admin-users-back"
          >
            Back to Dashboard
          </Link>
        </header>

        {error && (
          <div className="admin-users-error">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-users-success">
            {success}
          </div>
        )}

        <section className="create-staff-card">
          <div className="section-heading">
            <h2>
              Create Staff Account
            </h2>

            <p>
              Create a staff user
              directly without
              editing MongoDB.
            </p>
          </div>

          <form
            className="create-staff-form"
            onSubmit={
              handleCreateStaff
            }
          >
            <input
              type="text"
              name="name"
              value={
                staffForm.name
              }
              onChange={
                handleStaffFormChange
              }
              placeholder="Staff name"
              required
            />

            <input
              type="email"
              name="email"
              value={
                staffForm.email
              }
              onChange={
                handleStaffFormChange
              }
              placeholder="Staff email"
              required
            />

            <input
              type="text"
              name="department"
              value={
                staffForm.department
              }
              onChange={
                handleStaffFormChange
              }
              placeholder="Department"
            />

            <input
              type="password"
              name="password"
              minLength="6"
              value={
                staffForm.password
              }
              onChange={
                handleStaffFormChange
              }
              placeholder="Temporary password"
              required
            />

            <button
              type="submit"
              disabled={
                creating
              }
            >
              {creating
                ? "Creating..."
                : "Create Staff"}
            </button>
          </form>
        </section>

        <section className="users-management-card">
          <div className="section-heading">
            <h2>
              CampusCare Users
            </h2>

            <p>
              Total users:{" "}
              {
                pagination.total
              }
            </p>
          </div>

          <div className="user-filter-area">
            <form
              className="user-search-form"
              onSubmit={
                handleSearch
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
                placeholder="Search name, email or department..."
              />

              <button type="submit">
                Search
              </button>
            </form>

            <select
              value={
                roleFilter
              }
              onChange={(
                event
              ) => {
                setRoleFilter(
                  event.target
                    .value
                );

                setPage(1);
              }}
            >
              <option value="">
                All Roles
              </option>

              <option value="student">
                Students
              </option>

              <option value="staff">
                Staff
              </option>

              <option value="admin">
                Admin
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) => {
                setStatusFilter(
                  event.target
                    .value
                );

                setPage(1);
              }}
            >
              <option value="">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <button
              type="button"
              className="users-clear-button"
              onClick={
                handleClear
              }
            >
              Clear
            </button>
          </div>

          {appliedSearch && (
            <div className="users-active-search">
              Search:{" "}
              <strong>
                "
                {
                  appliedSearch
                }
                "
              </strong>
            </div>
          )}

          {loading ? (
            <div className="users-state">
              Loading users...
            </div>
          ) : users.length ===
            0 ? (
            <div className="users-state">
              No users found.
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>

                    <th>
                      Department
                    </th>

                    <th>Role</th>

                    <th>Status</th>

                    <th>
                      Joined
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(
                    (user) => {
                      const active =
                        user.isActive !==
                        false;

                      const busy =
                        actionUserId ===
                        user._id;

                      return (
                        <tr
                          key={
                            user._id
                          }
                        >
                          <td>
                            <strong>
                              {
                                user.name
                              }
                            </strong>

                            <span className="user-email">
                              {
                                user.email
                              }
                            </span>
                          </td>

                          <td>
                            {user.department ||
                              "—"}
                          </td>

                          <td>
                            {user.role ===
                            "admin" ? (
                              <span className="admin-role-label">
                                Admin
                              </span>
                            ) : (
                              <select
                                className="user-role-select"
                                value={
                                  user.role
                                }
                                disabled={
                                  busy
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleRoleChange(
                                    user._id,
                                    event
                                      .target
                                      .value
                                  )
                                }
                              >
                                <option value="student">
                                  Student
                                </option>

                                <option value="staff">
                                  Staff
                                </option>
                              </select>
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                active
                                  ? "user-status active-user"
                                  : "user-status inactive-user"
                              }
                            >
                              {active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td>
                            {new Date(
                              user.createdAt
                            ).toLocaleDateString()}
                          </td>

                          <td>
                            {user.role ===
                            "admin" ? (
                              <span className="protected-account">
                                Protected
                              </span>
                            ) : (
                              <button
                                type="button"
                                className={
                                  active
                                    ? "deactivate-user-button"
                                    : "activate-user-button"
                                }
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    user
                                  )
                                }
                              >
                                {busy
                                  ? "Updating..."
                                  : active
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages >
            1 && (
            <div className="users-pagination">
              <button
                type="button"
                disabled={
                  !pagination.hasPrevious
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current -
                      1
                  )
                }
              >
                Previous
              </button>

              <div className="users-page-numbers">
                {pageNumbers.map(
                  (
                    pageNumber
                  ) => (
                    <button
                      type="button"
                      key={
                        pageNumber
                      }
                      className={
                        pageNumber ===
                        pagination.page
                          ? "selected-user-page"
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
                type="button"
                disabled={
                  !pagination.hasNext
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current +
                      1
                  )
                }
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminUsersPage;