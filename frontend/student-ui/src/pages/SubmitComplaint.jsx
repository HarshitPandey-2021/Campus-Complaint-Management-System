import React from "react";
import Navbar from "../components/common/Navbar";
import ComplaintForm from "../components/complaints/ComplaintForm";

const SubmitComplaint = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl mt-10 p-10">
        <h2
          className="text-3xl font-bold text-center mb-6"
          style={{
            background:
              "linear-gradient(90deg,#c026d3,#ec4899,#0ea5e9,#008080)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Submit a New Complaint
        </h2>

        <ComplaintForm />
      </div>
    </div>
  );
};

export default SubmitComplaint;
