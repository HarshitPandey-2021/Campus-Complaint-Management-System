import React from "react";
import { Link } from "react-router-dom";

export default function RecentComplaints() {
  // Dummy data — replace with API later
  const recent = [
    {
      id: 1,
      title: "Water Leakage in Room",
      category: "Hostel",
      status: "Pending",
      date: "2025-02-12",
    },
    {
      id: 2,
      title: "Broken Fan in Lab",
      category: "Technical",
      status: "In Progress",
      date: "2025-02-11",
    },
    {
      id: 3,
      title: "Unclean Washrooms",
      category: "Hygiene",
      status: "Resolved",
      date: "2025-02-10",
    },
  ];

  const badgeColor = {
    Pending: "bg-yellow-500",
    Resolved: "bg-green-600",
    "In Progress": "bg-blue-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border">
      <h2 className="text-xl font-bold mb-5 text-gray-800">Recent Complaints</h2>

      <div className="space-y-4">
        {recent.map((c) => (
          <Link key={c.id} to={`/complaint/${c.id}`}>
            <div
              className="bg-gray-50 p-5 rounded-xl border hover:shadow-lg hover:-translate-y-1 
              transition-all cursor-pointer relative"
            >
              {/* Gradient top bar */}
              <div
                className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
                style={{
                  background:
                    "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
                }}
              />

              <h3 className="font-semibold text-gray-900">{c.title}</h3>

              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-gray-500">{c.category}</p>

                <span
                  className={`px-3 py-1 rounded-full text-xs text-white ${badgeColor[c.status]}`}
                >
                  {c.status}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-2">Filed on: {c.date}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-right mt-4">
        <Link
          to="/my-complaints"
          className="text-sm text-indigo-600 font-medium hover:underline"
        >
          View All →
        </Link>
      </div>
    </div>
  );
}
