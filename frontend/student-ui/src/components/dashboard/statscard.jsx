// src/components/dashboard/StatsCard.jsx
import React from "react";

export default function StatsCard({ title, value, color }) {
  return (
    <div
      className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:shadow-2xl transition"
      style={{ borderTop: `5px solid ${color}` }}
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>

      <p
        className="text-5xl font-bold"
        style={{ color: color }}
      >
        {value}
      </p>
    </div>
  );
}
