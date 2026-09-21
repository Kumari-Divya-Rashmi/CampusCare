import {
  API_BASE_URL,
} from "../config/api";

const getToken = () => {
  return localStorage.getItem(
    "campuscare_token"
  );
};

export const getMyNotifications =
  async (limit = 20) => {
    const token = getToken();

    const response =
      await fetch(
        `${API_BASE_URL}/notifications?limit=${limit}`,
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
          "Unable to load notifications"
      );
    }

    return data;
  };

export const markNotificationRead =
  async (
    notificationId
  ) => {
    const token = getToken();

    const response =
      await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",

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
          "Unable to update notification"
      );
    }

    return data;
  };

export const markAllNotificationsRead =
  async () => {
    const token = getToken();

    const response =
      await fetch(
        `${API_BASE_URL}/notifications/read-all`,
        {
          method: "PATCH",

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
          "Unable to update notifications"
      );
    }

    return data;
  };
