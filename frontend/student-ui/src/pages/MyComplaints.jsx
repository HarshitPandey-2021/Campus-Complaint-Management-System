import React from "react";
import Navbar from "../components/common/Navbar";
import ComplaintCard from "../components/complaints/ComplaintCard";
import FilterBar from "../components/complaints/FilterBar";

const MyComplaints = () => {
  const complaints = [
    { id: 1, title: "Hostel water leakage", category: "Hostel", status: "Pending" },
    { id: 2, title: "Broken fan in classroom", category: "Classroom", status: "In Progress" },
    { id: 3, title: "Library AC not working", category: "Library", status: "Resolved" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-10">
        <h2
          className="text-3xl font-bold text-center mb-6"
          style={{
            background:
              "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          My Complaints
        </h2>

        <FilterBar />

        <div className="space-y-6 mt-6">
          {complaints.map((item) => (
            <ComplaintCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyComplaints;
