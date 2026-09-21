import {
  API_BASE_URL,
} from "../config/api";

const getToken = () => {
  return localStorage.getItem(
    "campuscare_token"
  );
};

export const getAdminComplaints =
  async ({
    status = "",
    category = "",
    priority = "",
    search = "",
    sort = "latest",
    page = 1,
    limit = 6,
  } = {}) => {
    const token = getToken();

    const params =
      new URLSearchParams();

    if (status) {
      params.append(
        "status",
        status
      );
    }

    if (category) {
      params.append(
        "category",
        category
      );
    }

    if (priority) {
      params.append(
        "priority",
        priority
      );
    }

    if (search) {
      params.append(
        "search",
        search
      );
    }

    params.append(
      "sort",
      sort
    );

    params.append(
      "page",
      page
    );

    params.append(
      "limit",
      limit
    );

    const response = await fetch(
      `${API_BASE_URL}/admin/complaints?${params.toString()}`,
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
          "Unable to load complaints"
      );
    }

    return data;
  };

export const getStaffUsers =
  async () => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/admin/staff`,
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
          "Unable to load staff"
      );
    }

    return data;
  };

export const assignComplaint =
  async (
    complaintId,
    staffId
  ) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/admin/complaints/${complaintId}/assign`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          staffId,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to assign complaint"
      );
    }

    return data;
  };