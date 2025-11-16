import React from "react";

export default function ComplaintForm({ onSubmit }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
      <h2
        className="text-3xl font-bold mb-6 text-center"
        style={{
          background: "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Complaint Form
      </h2>

      <form className="space-y-5" onSubmit={onSubmit}>
        
        {/* Category */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Complaint Category
          </label>
          <select
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3]"
            required
          >
            <option value="">Select Category</option>
            <option>Hostel</option>
            <option>Classroom</option>
            <option>Hygiene</option>
            <option>Ragging</option>
            <option>Technical</option>
            <option>Others</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Complaint Title
          </label>
          <input
            type="text"
            placeholder="Short title of the issue"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#0ea5e9]"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Complaint Description
          </label>
          <textarea
            rows={5}
            placeholder="Describe the problem clearly..."
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#008080]"
            required
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Upload Image (optional)
          </label>

          <input
            type="file"
            accept="image/*"
            className="w-full border px-3 py-2 rounded-lg bg-gray-50 cursor-pointer focus:ring-2 focus:ring-[#c026d3]"
          />

          <p className="text-xs text-gray-500 mt-1">
            You can upload images of any size (JPG, PNG, JPEG).
          </p>
        </div>

        {/* Submit Button */}
        <button
          className="w-full py-3 rounded-xl text-white font-semibold shadow-lg hover:scale-[1.02] transition"
          style={{
            background:
              "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
          }}
        >
          Submit Complaint
        </button>
      </form>
    </div>
  );
}
