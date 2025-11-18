import React from "react";

export default function FilterBar({ onFilter }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap gap-4 justify-between items-center">

      {/* Category Dropdown */}
      <select
        className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#c026d3]"
        onChange={(e) => onFilter("category", e.target.value)}
      >
        <option value="">All Categories</option>
        <option>Hostel</option>
        <option>Classroom</option>
        <option>Hygiene</option>
        <option>Ragging</option>
        <option>Technical</option>
      </select>

      {/* Status Dropdown */}
      <select
        className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#008080]"
        onChange={(e) => onFilter("status", e.target.value)}
      >
        <option value="">All Status</option>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Resolved</option>
      </select>
    </div>
  );
}
