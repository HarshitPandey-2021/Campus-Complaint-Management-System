import React from "react";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import ComplaintDetails from "../components/complaints/complaintDetails";

const ComplaintDetailsPage = () => {
  const complaint = {
    id: 1,
    title: "Broken fan in classroom",
    category: "Infrastructure",
    description:
      "The ceiling fan in Room 204, Arts Block, is not working properly. It causes inconvenience to students during lectures.",
    status: "In Progress",
    date: "2025-11-04",
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-pink-50">
      <Header />
      <main className="flex-grow px-6 py-10 max-w-3xl mx-auto">
        <ComplaintDetails complaint={complaint} />
      </main>
      <Footer />
    </div>
  );
};

export default ComplaintDetailsPage;
