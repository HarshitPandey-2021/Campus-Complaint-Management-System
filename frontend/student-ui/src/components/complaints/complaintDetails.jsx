import React from "react";

export default function ComplaintDetails({ data }) {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl mt-10">

      <h1
        className="text-4xl font-bold mb-4"
        style={{
          background: "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {data.title}
      </h1>

      <p className="text-gray-600 mb-2">Category: {data.category}</p>
      <p className="text-gray-600 mb-6">
        Status:{" "}
        <span className="font-semibold text-indigo-700">
          {data.status}
        </span>
      </p>

      <p className="text-gray-800 leading-relaxed">{data.description}</p>

      <div className="mt-8 p-4 bg-gray-100 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800">Updates</h3>
        <p className="text-gray-700 mt-2">{data.updates}</p>
      </div>
    </div>
  );
}
