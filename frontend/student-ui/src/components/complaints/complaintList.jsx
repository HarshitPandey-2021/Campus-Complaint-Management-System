import React from "react";
import ComplaintCard from "components/complaints/ComplaintCard";

export default function ComplaintList({ complaints }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {complaints.map((item) => (
        <ComplaintCard key={item.id} complaint={item} />
      ))}
    </div>
  );
}
