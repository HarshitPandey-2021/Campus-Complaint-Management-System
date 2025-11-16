// components/dashboard/StatsCard.jsx
import React from "react";

export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border relative 
      hover:shadow-lg transition-all">
      
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
        style={{
          background: "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)"
        }}
      ></div>

      <h3 className="text-gray-600 text-lg font-semibold">{title}</h3>
      <p className="text-4xl font-extrabold mt-2 text-gray-900">
        {value}
      </p>
    </div>
  );
}
