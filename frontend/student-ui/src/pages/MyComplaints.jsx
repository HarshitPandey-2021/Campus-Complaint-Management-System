import React, { useState, useEffect } from "react";
import Navbar from "../components/common/Navbar";
import ComplaintCard from "../components/complaints/ComplaintCard";
import FilterBar from "../components/complaints/FilterBar";
import { getMyComplaints } from "../api";

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    getMyComplaints(token).then((data) => {
      setComplaints(data);
      setLoading(false);
    });
  }, []);

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
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            complaints.map((item) => (
              <ComplaintCard key={item.id} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default MyComplaints;
