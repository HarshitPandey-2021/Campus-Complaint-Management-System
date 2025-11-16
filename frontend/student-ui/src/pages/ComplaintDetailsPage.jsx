import React from "react";
import { useParams, Link } from "react-router-dom";

export default function ComplaintDetailsPage() {
  const { id } = useParams();

  // Dummy complaint data — replace later with API
  const complaint = {
    title: "Water Leakage in Room 204",
    category: "Hostel",
    status: "Pending",
    date: "2025-02-12",
    description:
      "Severe water leakage from the ceiling of Room 204 for the last 3 days. The smell is increasing and the walls are becoming damp.",
    updates: [
      {
        by: "Admin",
        date: "Today",
        message: "Technician has been assigned. They will visit soon.",
      },
      {
        by: "Admin",
        date: "Yesterday",
        message: "Issue forwarded to maintenance team.",
      },
    ],
  };

  const badgeColor = {
    Pending: "bg-yellow-500",
    Resolved: "bg-green-600",
    "In Progress": "bg-blue-600",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto p-6 mt-10">
        {/* BACK BUTTON */}
        <Link
          to="/my-complaints"
          className="text-sm px-4 py-2 rounded-full shadow bg-white border hover:bg-gray-50"
        >
          ← Back to My Complaints
        </Link>

        {/* MAIN CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mt-6 relative">
          {/* Gradient Top Border */}
          <div
            className="absolute top-0 left-0 w-full h-2 rounded-t-2xl"
            style={{
              background:
                "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
            }}
          />

          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Complaint #{id}
          </h2>
          <p className="text-lg font-medium text-gray-700">{complaint.title}</p>

          {/* Category & Status */}
          <div className="mt-4 flex items-center gap-4">
            <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
              {complaint.category}
            </span>

            <span
              className={`px-4 py-1 text-white rounded-full text-sm ${badgeColor[complaint.status]}`}
            >
              {complaint.status}
            </span>
          </div>

          <p className="text-gray-400 mt-3 text-sm">
            Filed on: {complaint.date}
          </p>

          {/* DESCRIPTION */}
          <h3 className="text-2xl font-semibold mt-8 mb-2 text-gray-800">
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {complaint.description}
          </p>

          {/* ADMIN UPDATES */}
          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-800">
            Admin Updates
          </h3>

          <div className="space-y-4">
            {complaint.updates.map((u, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-xl border shadow-sm"
              >
                <p className="font-semibold text-indigo-600">
                  {u.by} • {u.date}
                </p>
                <p className="text-gray-700">{u.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
