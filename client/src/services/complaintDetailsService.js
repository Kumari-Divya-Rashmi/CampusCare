import {
  API_BASE_URL,
} from "../config/api";

const getToken = () => {
  return localStorage.getItem(
    "campuscare_token"
  );
};

export const getComplaintDetails =
  async (complaintId) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/complaints/${complaintId}/details`,
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
          "Unable to load complaint details"
      );
    }

    return data;
  };

export const addComplaintComment =
  async (
    complaintId,
    message
  ) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/complaints/${complaintId}/comments`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          message,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to add comment"
      );
    }

    return data;
  };

export const submitComplaintFeedback =
  async (
    complaintId,
    rating,
    comment
  ) => {
    const token = getToken();

    const response = await fetch(
      `${API_BASE_URL}/complaints/${complaintId}/feedback`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          rating,
          comment,
        }),
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to submit feedback"
      );
    }

    return data;
  };