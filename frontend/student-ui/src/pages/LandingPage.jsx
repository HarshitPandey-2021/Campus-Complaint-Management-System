import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/common/button";
import Header from "../components/common/header";
import Footer from "../components/common/footer";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-pink-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow px-6 py-16 text-center">
        {/* University Logo / Placeholder */}
        <div className="mb-6">
          <img
            src="/images/university-logo.png"
            alt="University of Lucknow Logo"
            className="w-28 h-28 object-contain mx-auto mb-4"
            onError={(e) => (e.target.style.display = "none")} // hides if logo not found
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-700 to-pink-600">
          Campus Complaint Management System
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-lg text-gray-700 max-w-2xl">
          A unified digital platform by <span className="font-semibold">University of Lucknow</span> 
          to ensure transparent, fast, and efficient redressal of student and faculty concerns.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            label="Login"
            color="teal"
            onClick={() => navigate("/login")}
          />
          <Button
            label="Sign Up"
            color="blue"
            onClick={() => navigate("/signup")}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
