import React, { useState } from "react";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import FilterBar from "../components/complaints/FilterBar";
import ComplaintList from "../components/complaints/complaintList";

const MyComplaints = () => {
  const [filters, setFilters] = useState({ category: "", status: "" });

  const complaints = [
    { id: 1, title: "Broken chair in classroom", category: "Infrastructure", status: "Pending" },
    { id: 2, title: "Canteen hygiene issue", category: "Canteen", status: "Resolved" },
    { id: 3, title: "Hostel electricity problem", category: "Hostel", status: "In Progress" },
  ];

  const filtered = complaints.filter((c) => {
    return (
      (!filters.category || c.category === filters.category) &&
      (!filters.status || c.status === filters.status)
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-teal-50">
      <Header />
      <main className="flex-grow px-6 py-10">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          My Complaints
        </h1>
        <FilterBar filters={filters} setFilters={setFilters} />
        <ComplaintList complaints={filtered} />
      </main>
      <Footer />
    </div>
  );
};

export default MyComplaints;
