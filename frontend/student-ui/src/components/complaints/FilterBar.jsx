import React from "react";

const FilterBar = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-wrap gap-4 justify-between items-center bg-gradient-to-r from-teal-50 via-blue-50 to-magenta-50 p-4 rounded-xl shadow">
      <select
        name="category"
        value={filters.category}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">All Categories</option>
        <option value="Infrastructure">Infrastructure</option>
        <option value="Hostel">Hostel</option>
        <option value="Canteen">Canteen</option>
        <option value="Faculty">Faculty</option>
        <option value="Administration">Administration</option>
      </select>

      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Resolved">Resolved</option>
        <option value="In Progress">In Progress</option>
      </select>
    </div>
  );
};

export default FilterBar;
