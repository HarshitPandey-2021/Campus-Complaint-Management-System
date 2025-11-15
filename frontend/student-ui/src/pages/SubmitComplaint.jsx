import React from "react";

export default function SubmitComplaint() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-6">
          Submit Complaint
        </h2>

        <form className="space-y-4">
          <input
            placeholder="Complaint Title"
            className="w-full border px-3 py-2 rounded-lg"
          />

          <textarea
            placeholder="Describe your issue"
            className="w-full border px-3 py-2 rounded-lg h-32"
          ></textarea>

          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 transition">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
