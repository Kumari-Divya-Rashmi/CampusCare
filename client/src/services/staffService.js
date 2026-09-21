import {
  API_BASE_URL,
} from "../config/api";

const getToken = () => {
  return localStorage.getItem(
    "campuscare_token"
  );
};

export const getAssignedComplaints =
  async () => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/staff/complaints`,
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
          "Unable to load assigned complaints"
      );
    }

    return data;
  };

export const updateComplaintStatus =
  async (
    complaintId,
    status
  ) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/staff/complaints/${complaintId}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          status,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to update complaint"
      );
    }

    return data;
  };