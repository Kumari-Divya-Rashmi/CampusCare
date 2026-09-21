import { useState } from "react";
import { Link } from "react-router-dom";

import {
  createComplaint,
} from "../services/complaintService";

const CreateComplaintPage = () => {
  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      location: "",
    });

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value,
    });
  };

  const handleImageChange = (event) => {
    const file =
      event.target.files[0];

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG and WEBP images are allowed"
      );

      setImageFile(null);
      setImagePreview("");

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image must be smaller than 5 MB"
      );

      setImageFile(null);
      setImagePreview("");

      event.target.value = "";

      return;
    }

    setError("");

    setImageFile(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data =
        await createComplaint(
          formData,
          imageFile
        );

      setSuccess(data.message);

      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        location: "",
      });

      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-page">
      <div className="complaint-card">
        <div className="page-header">
          <div>
            <h1>
              Create Complaint
            </h1>

            <p>
              Report a campus
              maintenance issue.
            </p>
          </div>

          <Link to="/student">
            Back to Dashboard
          </Link>
        </div>

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

        <form
          onSubmit={handleSubmit}
          className="complaint-form"
        >
          <label>
            Complaint Title
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Example: Hostel Wi-Fi not working"
            minLength="5"
            maxLength="120"
            required
          />

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={
              formData.description
            }
            onChange={handleChange}
            placeholder="Explain the problem clearly"
            minLength="10"
            maxLength="1000"
            rows="5"
            required
          />

          <label>
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">
              Select category
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

          <label>
            Priority
          </label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
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

          <label>
            Location
          </label>

          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Example: Hostel 2, Third Floor"
            required
          />

          <label>
            Evidence Image
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={
              handleImageChange
            }
          />

          <small className="image-help">
            Optional. JPG, PNG or WEBP.
            Maximum size: 5 MB.
          </small>

          {imagePreview && (
            <div className="image-preview-wrapper">
              <img
                src={imagePreview}
                alt="Complaint evidence preview"
                className="image-preview"
              />

              <button
                type="button"
                className="remove-image-button"
                onClick={
                  handleRemoveImage
                }
              >
                Remove Image
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateComplaintPage;