import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-indigo-50 flex flex-col">
      <header className="bg-indigo-600 text-white shadow-lg p-6 text-center">
        <h1 className="text-4xl font-extrabold">Campus Complaint Management System</h1>
        <p className="mt-2 text-lg opacity-90">University of Lucknow</p>
      </header>

      <main className="flex flex-col justify-center items-center flex-grow space-y-6 p-6">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to CCMS 👋</h2>
        <p className="text-lg text-gray-600 text-center max-w-2xl">
          Report, track complaints, and help make your campus better — faster, simpler, and smarter.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/login-signup', { state: { tab: 'student', login: true } })}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Student Login
          </button>
          <button
            onClick={() => navigate('/login-signup', { state: { tab: 'faculty', login: true } })}
            className="px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
          >
            Faculty Login
          </button>
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-300 text-center py-4">
        &copy; 2025 University of Lucknow | Version 1.0.0
      </footer>
    </div>
  );
};

export default LandingPage;
