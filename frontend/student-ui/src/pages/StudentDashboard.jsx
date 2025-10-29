import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComplaintsContext } from '../context/ComplaintsContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { complaints } = useContext(ComplaintsContext);
  const userEmail = 'student1@student.com';

  const studentComplaints = complaints.filter(c => c.userType === 'student' && c.userEmail === userEmail);

  return (
    <div className="min-h-screen bg-indigo-50">
      <header className="bg-indigo-600 text-white p-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <button
          onClick={() => navigate('/report-complaint')}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Report Complaint
        </button>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Your Complaints</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {studentComplaints.length === 0 ? (
            <p className="text-gray-600 col-span-2">No complaints submitted yet.</p>
          ) : (
            studentComplaints.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-indigo-600 hover:shadow-xl transition">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-800 text-lg">{c.category}</p>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      c.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{c.description}</p>
                <p className="text-sm text-gray-400">Submitted: {c.date}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
