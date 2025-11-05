import React from "react";
import ComplaintCard from "./complaintcard";

const ComplaintList = ({ complaints, onView }) => {
  if (!complaints?.length)
    return (
      <p className="text-center text-gray-500 mt-8">
        No complaints found. Try submitting one.
      </p>
    );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {complaints.map((complaint) => (
        <ComplaintCard
          key={complaint.id}
          complaint={complaint}
          onView={onView}
        />
      ))}
    </div>
  );
};

export default ComplaintList;
