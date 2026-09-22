import {
  API_BASE_URL,
} from "../config/api";

const getToken = () => {
  return localStorage.getItem(
    "campuscare_token"
  );
};

export const getAdminUsers =
  async ({
    search = "",
    role = "",
    status = "",
    page = 1,
    limit = 10,
  } = {}) => {
    const token =
      getToken();

    const params =
      new URLSearchParams();

    if (search) {
      params.append(
        "search",
        search
      );
    }

    if (role) {
      params.append(
        "role",
        role
      );
    }

    if (status) {
      params.append(
        "status",
        status
      );
    }

    params.append(
      "page",
      page
    );

    params.append(
      "limit",
      limit
    );

    const response =
      await fetch(
        `${API_BASE_URL}/admin/users?${params.toString()}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to load users"
      );
    }

    return data;
  };

export const createStaffUser =
  async (staffData) => {
    const token =
      getToken();

    const response =
      await fetch(
        `${API_BASE_URL}/admin/users/staff`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify(
              staffData
            ),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to create staff account"
      );
    }

    return data;
  };

export const updateUserStatus =
  async (
    userId,
    isActive
  ) => {
    const token =
      getToken();

    const response =
      await fetch(
        `${API_BASE_URL}/admin/users/${userId}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify({
              isActive,
            }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to update user status"
      );
    }

    return data;
  };

export const updateUserRole =
  async (
    userId,
    role
  ) => {
    const token =
      getToken();

    const response =
      await fetch(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify({
              role,
            }),
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to update user role"
      );
    }

    return data;
  };