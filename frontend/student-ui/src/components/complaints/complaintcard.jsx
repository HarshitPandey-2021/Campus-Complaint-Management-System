import React from "react";

const ComplaintCard = ({ complaint, onView }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition duration-300 p-4 cursor-pointer"
      onClick={() => onView && onView(complaint.id)}
    >
      <h3 className="text-lg font-semibold text-blue-700 mb-1">
        {complaint.title}
      </h3>
      <p className="text-sm text-gray-500 mb-2">{complaint.category}</p>
      <p className="text-gray-700 line-clamp-2">{complaint.description}</p>
      <div className="mt-3 text-xs text-right text-magenta-600">
        Status: {complaint.status || "Pending"}
      </div>
    </div>
  );
};

export default ComplaintCard;
