import React from "react";

const RecentComplaints = ({ complaints }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-blue-700 mb-4">
        Recent Complaints
      </h2>

      {(!complaints || complaints.length === 0) ? (
        <p className="text-gray-500 text-center">No recent complaints.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {complaints.slice(0, 5).map((c) => (
            <li key={c.id} className="py-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-teal-700 font-medium">{c.title}</h4>
                  <p className="text-gray-500 text-sm">{c.category}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    c.status === "Resolved"
                      ? "bg-teal-100 text-teal-700"
                      : c.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-pink-100 text-pink-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentComplaints;
