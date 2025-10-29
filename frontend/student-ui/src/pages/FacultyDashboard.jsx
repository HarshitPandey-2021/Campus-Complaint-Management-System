import React, { useContext } from 'react';
import { ComplaintsContext } from '../context/ComplaintsContext';

const FacultyDashboard = () => {
  const { complaints } = useContext(ComplaintsContext);
  const userEmail = 'faculty1@faculty.com';

  const facultyComplaints = complaints.filter(c => c.userType === 'faculty' && c.userEmail === userEmail);

  return (
    <div className="min-h-screen bg-teal-50">
      <header className="bg-teal-600 text-white p-6 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Assigned Complaints</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {facultyComplaints.length === 0 ? (
            <p className="text-gray-600 col-span-2">No assigned complaints yet.</p>
          ) : (
            facultyComplaints.map(c => (
              <div key={c.id} className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-teal-600 hover:shadow-xl transition">
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

export default FacultyDashboard;
