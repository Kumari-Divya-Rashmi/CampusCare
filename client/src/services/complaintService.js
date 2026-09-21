import {
  API_BASE_URL,
} from "../config/api";

export const createComplaint =
  async (
    complaintData,
    imageFile
  ) => {
    const token =
      localStorage.getItem(
        "campuscare_token"
      );

    const formData =
      new FormData();

    formData.append(
      "title",
      complaintData.title
    );

    formData.append(
      "description",
      complaintData.description
    );

    formData.append(
      "category",
      complaintData.category
    );

    formData.append(
      "priority",
      complaintData.priority
    );

    formData.append(
      "location",
      complaintData.location
    );

    if (imageFile) {
      formData.append(
        "image",
        imageFile
      );
    }

    const response =
      await fetch(
        `${API_BASE_URL}/complaints`,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },

          body: formData,
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to create complaint"
      );
    }

    return data;
  };

export const getMyComplaints =
  async () => {
    const token = localStorage.getItem(
      "campuscare_token"
    );

    const response = await fetch(
      `${API_BASE_URL}/complaints/my`,
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