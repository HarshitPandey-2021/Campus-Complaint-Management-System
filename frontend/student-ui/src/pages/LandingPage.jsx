import React from "react";
import Navbar from "../components/common/NavBar";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-bg">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center h-[70vh] flex flex-col justify-center items-center text-center"
        style={{
          backgroundImage:
            "url('https://www.lkouniv.ac.in/site/writereaddata/HomePage/Header/H_202403191545264198.jpg')",
        }}
      >
        <div className="bg-black bg-opacity-40 absolute inset-0" />
        <div className="relative z-10 text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Campus Grievance Redressal Portal
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Report and Track Campus Issues
          </p>
          <button className="bg-yellow-400 text-gray-900 px-6 py-3 font-semibold rounded-lg shadow hover:bg-yellow-300 transition">
            Report and Track your Campus Issues
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="py-16 px-6 md:px-20 grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3">Submit Complaints</h3>
          <p className="text-gray-600">
            Register and report campus-related issues conveniently.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3">Track Status</h3>
          <p className="text-gray-600">
            Check your complaint status in real-time.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3">Admin Transparency</h3>
          <p className="text-gray-600">
            Transparent reporting and progress tracking.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-700 text-white py-6 text-center">
        <p>© 2025 University of Lucknow | Campus Complaint Portal</p>
      </footer>
    </div>
  );
};

export default LandingPage;
