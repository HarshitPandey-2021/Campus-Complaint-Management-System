import React from "react";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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

          
          <button
            onClick={() => navigate("/login")}
            className="bg-yellow-400 text-gray-900 px-6 py-3 font-semibold rounded-lg shadow hover:bg-yellow-300 transition"
          >
            Report and Track Campus Issues
          </button>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-16 px-6 md:px-20 grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Submit Complaints
          </h3>
          <p className="text-gray-600">
            Register and report campus issues conveniently.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Track Status
          </h3>
          <p className="text-gray-600">
            Check your complaint status in real-time.
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Admin Transparency
          </h3>
          <p className="text-gray-600">
            Transparent reporting and progress tracking.
          </p>
        </div>
      </section>

      {/* How It Works + Stats */}
      <section className="px-6 md:px-20 py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">
              How It Works
            </h2>
            <ol className="space-y-4 text-gray-700 text-lg">
              <li>Login using your credentials.</li>
              <li>Submit your concern or complaint.</li>
              <li>Track progress through your dashboard.</li>
              <li>Receive timely updates and resolution.</li>
            </ol>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">
              Quick Overview
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              💬 1200+ Complaints Resolved
            </p>
            <p className="text-lg text-gray-700 mb-2">
              ⚡ Average 24-Hour Response Time
            </p>
            <p className="text-lg text-gray-700">🎯 95% User Satisfaction</p>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="px-6 md:px-20 py-16 text-center bg-white">
        <h2 className="text-4xl font-bold mb-4 text-indigo-700">About Us</h2>
        <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed text-lg mb-10">
          This Campus Grievance Redressal Portal of University of Lucknow is a
          novel initiative to promote transparency, accountability, and prompt
          action across all student, faculty and staff-related concerns.
        </p>

        {/* Student Reviews */}
        <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
          Student Reviews
        </h3>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition">
            <p className="italic text-gray-700">
              "Quick response and very helpful staff!"
            </p>
            <h4 className="mt-3 font-semibold text-indigo-700">
              – Andrew Sans
            </h4>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition">
            <p className="italic text-gray-700">
              "Resolved my complaint within a day!"
            </p>
            <h4 className="mt-3 font-semibold text-indigo-700">
              – Eric Rocks
            </h4>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition">
            <p className="italic text-gray-700">
              "Very transparent and easy to track."
            </p>
            <h4 className="mt-3 font-semibold text-indigo-700">– Raveric</h4>
          </div>
        </div>

        {/* Team */}
        <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
          Our Team
        </h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          <div className="flex flex-col items-center">
            <img
              src="/images/team1.jpg"
              className="w-32 h-32 object-cover rounded-full shadow-md mb-3"
            />
            <p className="font-semibold text-indigo-700">Person 1</p>
            <p className="text-gray-600 text-sm">Work</p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="/images/team2.jpg"
              className="w-32 h-32 object-cover rounded-full shadow-md mb-3"
            />
            <p className="font-semibold text-indigo-700">Person 2</p>
            <p className="text-gray-600 text-sm">Work</p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="/images/team3.jpg"
              className="w-32 h-32 object-cover rounded-full shadow-md mb-3"
            />
            <p className="font-semibold text-indigo-700">Person 3</p>
            <p className="text-gray-600 text-sm">Work</p>
          </div>

          <div className="flex flex-col items-center">
            <img
              src="/images/team4.jpg"
              className="w-32 h-32 object-cover rounded-full shadow-md mb-3"
            />
            <p className="font-semibold text-indigo-700">Person 4</p>
            <p className="text-gray-600 text-sm">Work</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        className="bg-gradient-to-r from-teal-500 via-pink-500 to-blue-700 bg-opacity-90 py-16 text-white text-center"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <p className="max-w-2xl mx-auto text-lg mb-8">
          Have queries or concerns? We're here to help!
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-10 text-base">
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-64">
            <h3 className="font-semibold text-xl mb-2">📍 Address</h3>
            <p>University of Lucknow</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-64">
            <h3 className="font-semibold text-xl mb-2">📧 Email</h3>
            <p>example@abc.edu.in</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-lg w-64">
            <h3 className="font-semibold text-xl mb-2">📞 Phone</h3>
            <p>+91 9988776655</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-700 text-white py-6 text-center">
        <p>© 2025 University of Lucknow | Campus-related Complaint Portal</p>
      </footer>
    </div>
  );
};

export default LandingPage;
