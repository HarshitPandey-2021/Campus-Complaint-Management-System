import React from "react";
import { Link } from "react-router-dom";

export default function ComplaintCard({ id, title, category, status, date }) {
  const badgeColor = {
    Pending: "bg-yellow-500",
    Resolved: "bg-green-600",
    "In Progress": "bg-blue-600",
  };

  return (
    <Link to={`/complaints/${id}`}>
      <div
        className="bg-white shadow-md rounded-2xl p-6 border hover:shadow-lg 
        transition-all hover:-translate-y-1 cursor-pointer relative"
      >
        {/* Gradient top bar */}
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
          style={{
            background:
              "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
          }}
        />

        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-gray-500 text-sm">{category}</p>

        <span
          className={`text-white px-3 py-1 rounded-full text-sm absolute right-4 top-4 
          ${badgeColor[status]}`}
        >
          {status}
        </span>

        <p className="text-gray-400 text-xs mt-4">Filed on: {date}</p>
      </div>
    </Link>
  );
}
