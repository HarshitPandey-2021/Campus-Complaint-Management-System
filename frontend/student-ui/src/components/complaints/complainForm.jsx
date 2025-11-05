import React, { useState } from "react";
import Button from "../common/Button";

const ComplaintForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    setFormData({ title: "", category: "", description: "" });
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 max-w-lg mx-auto mt-8 border border-gray-200">
      <h2 className="text-2xl font-semibold text-teal-700 mb-4 text-center">
        Submit a Complaint
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Complaint Title"
          required
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Hostel">Hostel</option>
          <option value="Canteen">Canteen</option>
          <option value="Faculty">Faculty</option>
          <option value="Administration">Administration</option>
        </select>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your issue..."
          rows="5"
          required
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-magenta-500"
        />

        <Button type="submit" label="Submit Complaint" color="teal" />
      </form>
    </div>
  );
};

export default ComplaintForm;
