import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComplaintsContext } from '../context/ComplaintsContext';

const ReportComplaint = () => {
  const navigate = useNavigate();
  const { addComplaint } = useContext(ComplaintsContext);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addComplaint({
      userType: 'student',
      userEmail: 'student1@student.com', // mock logged-in student
      category,
      description,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    });
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Report a Complaint</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="Library">Library</option>
              <option value="Lab">Lab</option>
              <option value="Hostel">Hostel</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Submit Complaint
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportComplaint;
