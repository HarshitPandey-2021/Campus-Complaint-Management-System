// src/services/userService.js

// Mock data for current user's complaints
let mockComplaints = [
  {
    id: 101,
    userId: 1,
    subject: "Broken Ceiling Fan in Classroom",
    category: "Fan",
    location: "Room 301, Block A",
    status: "Pending",
    priority: "High",
    submittedAt: "2025-01-28T10:30:00",
    description: "The ceiling fan in Room 301 has stopped working completely. Students are facing discomfort during lectures.",
    images: [],
    verificationDocument: null,
    isAnonymous: false,
    adminRemarks: null,
    assignedTo: null,
    expectedResolutionDate: null
  },
  {
    id: 102,
    userId: 1,
    subject: "WiFi Not Working in Library",
    category: "Internet",
    location: "Central Library, 2nd Floor",
    status: "In Progress",
    priority: "Medium",
    submittedAt: "2025-01-27T14:20:00",
    description: "WiFi connectivity is very poor on the 2nd floor. Unable to access online resources.",
    images: [],
    verificationDocument: null,
    isAnonymous: false,
    adminRemarks: "IT team assigned. Router upgrade scheduled.",
    assignedTo: "IT Department",
    expectedResolutionDate: "2025-01-30"
  },
  {
    id: 103,
    userId: 1,
    subject: "Broken Projector",
    category: "Projector",
    location: "Room 205, Block B",
    status: "Resolved",
    priority: "Medium",
    submittedAt: "2025-01-25T09:15:00",
    description: "Projector display is blurry and not clear.",
    images: [],
    verificationDocument: null,
    isAnonymous: false,
    adminRemarks: "Projector lens cleaned. Issue resolved.",
    assignedTo: "Maintenance Team",
    expectedResolutionDate: "2025-01-26",
    resolvedAt: "2025-01-26T16:30:00"
  },
  {
    id: 104,
    userId: 1,
    subject: "Leaking Water Tap",
    category: "Water",
    location: "Boys Washroom, Ground Floor",
    status: "Pending",
    priority: "Low",
    submittedAt: "2025-01-26T11:45:00",
    description: "Water tap is continuously leaking, wasting water.",
    images: [],
    verificationDocument: null,
    isAnonymous: true,
    adminRemarks: null,
    assignedTo: null,
    expectedResolutionDate: null
  },
  {
    id: 105,
    userId: 1,
    subject: "Broken Window Glass",
    category: "Furniture",
    location: "Room 102, Block C",
    status: "Rejected",
    priority: "High",
    submittedAt: "2025-01-24T08:00:00",
    description: "Window glass cracked, needs replacement.",
    images: [],
    verificationDocument: null,
    isAnonymous: false,
    adminRemarks: "Duplicate complaint. Already reported by faculty.",
    assignedTo: null,
    expectedResolutionDate: null
  }
];

// ✅ Get all complaints for current user
export const getMyComplaints = () => {
  return [...mockComplaints].sort((a, b) => 
    new Date(b.submittedAt) - new Date(a.submittedAt)
  );
};

// ✅ Get user's complaint statistics
export const getMyStats = () => {
  const total = mockComplaints.length;
  const pending = mockComplaints.filter(c => c.status === 'Pending').length;
  const inProgress = mockComplaints.filter(c => c.status === 'In Progress').length;
  const resolved = mockComplaints.filter(c => c.status === 'Resolved').length;
  
  return { total, pending, inProgress, resolved };
};

// ✅ Get single complaint by ID
export const getComplaintById = (id) => {
  return mockComplaints.find(c => c.id === parseInt(id));
};

// ✅ Submit new complaint (THIS WAS MISSING OR NOT EXPORTED)
export const submitComplaint = (complaintData) => {
  const newComplaint = {
    id: Date.now(), // Generate unique ID
    userId: 1, // Current user ID (hardcoded for now)
    ...complaintData,
    status: 'Pending',
    submittedAt: new Date().toISOString(),
    adminRemarks: null,
    assignedTo: null,
    expectedResolutionDate: null,
    resolvedAt: null
  };
  
  // Add to beginning of array (most recent first)
  mockComplaints.unshift(newComplaint);
  
  return newComplaint;
};

// ✅ Update complaint (only if Pending and not assigned)
export const updateComplaint = (id, updates) => {
  const index = mockComplaints.findIndex(c => c.id === parseInt(id));
  
  if (index !== -1) {
    const complaint = mockComplaints[index];
    
    // Only allow updates if Pending and not assigned
    if (complaint.status === 'Pending' && !complaint.assignedTo) {
      mockComplaints[index] = { 
        ...complaint, 
        ...updates,
        // Keep these fields unchanged
        id: complaint.id,
        userId: complaint.userId,
        status: complaint.status,
        submittedAt: complaint.submittedAt
      };
      return mockComplaints[index];
    }
  }
  
  return null;
};

// ✅ Delete complaint (optional - if you want this feature)
export const deleteComplaint = (id) => {
  const index = mockComplaints.findIndex(c => c.id === parseInt(id));
  
  if (index !== -1) {
    const complaint = mockComplaints[index];
    
    // Only allow delete if Pending and not assigned
    if (complaint.status === 'Pending' && !complaint.assignedTo) {
      mockComplaints.splice(index, 1);
      return true;
    }
  }
  
  return false;
};

// ✅ Filter complaints by status
export const filterComplaintsByStatus = (status) => {
  if (status === 'all' || !status) {
    return getMyComplaints();
  }
  return mockComplaints.filter(c => c.status === status);
};

// ✅ Search complaints
export const searchComplaints = (query) => {
  const lowerQuery = query.toLowerCase();
  return mockComplaints.filter(c => 
    c.subject.toLowerCase().includes(lowerQuery) ||
    c.location.toLowerCase().includes(lowerQuery) ||
    c.category.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery)
  );
};