import React, { createContext, useState } from 'react';

// Initial mock complaints
const initialComplaints = [
  { id: 1, userType: 'student', userEmail: 'student1@student.com', category: 'Classroom', description: 'Fan not working in class.', status: 'Pending', date: '2025-10-24' },
  { id: 2, userType: 'faculty', userEmail: 'faculty1@faculty.com', category: 'Lab', description: 'Projector malfunction in Lab 3.', status: 'In Progress', date: '2025-10-22' },
  { id: 3, userType: 'student', userEmail: 'student2@student.com', category: 'Hostel', description: 'Water leakage in bathroom.', status: 'Resolved', date: '2025-10-20' },
];

export const ComplaintsContext = createContext();

export const ComplaintsProvider = ({ children }) => {
  const [complaints, setComplaints] = useState(initialComplaints);

  const addComplaint = (newComplaint) => {
    setComplaints(prev => [...prev, { ...newComplaint, id: prev.length + 1 }]);
  };

  return (
    <ComplaintsContext.Provider value={{ complaints, addComplaint }}>
      {children}
    </ComplaintsContext.Provider>
  );
};
