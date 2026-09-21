import {
  API_BASE_URL,
} from "../config/api";

export const getAdminAnalytics =
  async () => {
    const token =
      localStorage.getItem(
        "campuscare_token"
      );

    const response =
      await fetch(
        `${API_BASE_URL}/admin/analytics`,
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
          "Unable to load analytics"
      );
    }

    return data;
  };