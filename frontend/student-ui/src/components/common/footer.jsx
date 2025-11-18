import React from "react";

const Footer = () => {
  return (
    <footer className="bg-teal-800 text-gray-200 py-4 mt-10">
      <div className="max-w-7xl mx-auto text-center text-sm">
        <p>© {new Date().getFullYear()} University of Lucknow | Campus Complaint Management System</p>
        <p className="text-gray-400 mt-1">Empowering Students • Streamlining Campus Voices</p>
      </div>
    </footer>
  );
};

export default Footer;
