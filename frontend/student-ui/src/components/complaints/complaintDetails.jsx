import React from "react";
import Card from "../common/Card";

const ComplaintDetails = ({ complaint }) => {
  if (!complaint)
    return <p className="text-center text-gray-500">No complaint selected.</p>;

  return (
    <Card title={`Complaint: ${complaint.title}`}>
      <p>
        <strong>Category:</strong> {complaint.category}
      </p>
      <p className="mt-2">
        <strong>Description:</strong>
        <br />
        {complaint.description}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        <strong>Status:</strong> {complaint.status || "Pending"}
      </p>
      <p className="mt-2 text-sm text-gray-400">
        Submitted on: {complaint.date || "N/A"}
      </p>
    </Card>
  );
};

export default ComplaintDetails;
