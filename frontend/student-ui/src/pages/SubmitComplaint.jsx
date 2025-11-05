import React from "react";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import ComplaintForm from "../components/complaints/complainForm";

const SubmitComplaint = () => {
  const handleComplaintSubmit = (data) => {
    console.log("New Complaint Submitted:", data);
    alert("Complaint submitted successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-pink-50">
      <Header />
      <main className="flex-grow px-6 py-10">
        <ComplaintForm onSubmit={handleComplaintSubmit} />
      </main>
      <Footer />
    </div>
  );
};

export default SubmitComplaint;
