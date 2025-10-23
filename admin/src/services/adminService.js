// src/services/adminService.js

// ============================================
// MOCK DATA - 8+ Complaints
// ============================================

let complaints = [
  {
    id: 1,
    subject: "Broken Ceiling Fan in Room 101",
    category: "Fan",
    location: "Room 101, Main Building, Floor 2",
    status: "Pending",
    priority: "High",
    submittedBy: "Rahul Sharma",
    email: "rahul@college.edu",
    submittedAt: "2025-01-15T09:30:00",
    description: "The ceiling fan is not working properly and makes strange noises when turned on. It needs immediate repair as the room gets very hot.",
    imageUrl: null,
    adminRemarks: "",
    assignedTo: null,
    updatedAt: "2025-01-15T09:30:00"
  },
  {
    id: 2,
    subject: "Dirty Washroom in Block A",
    category: "Cleanliness",
    location: "Block A, Floor 1, Boys Washroom",
    status: "In Progress",
    priority: "Medium",
    submittedBy: "Priya Patel",
    email: "priya@college.edu",
    submittedAt: "2025-01-14T11:20:00",
    description: "The washroom has not been cleaned for days. There's water leakage and the floor is slippery.",
    imageUrl: null,
    adminRemarks: "Cleaning staff assigned",
    assignedTo: "Maintenance Team",
    updatedAt: "2025-01-14T14:30:00"
  },
  {
    id: 3,
    subject: "Projector Not Working in Lab 203",
    category: "Projector",
    location: "Lab 203, IT Block, Floor 2",
    status: "Resolved",
    priority: "High",
    submittedBy: "Amit Kumar",
    email: "amit@college.edu",
    submittedAt: "2025-01-13T08:15:00",
    description: "The projector is not displaying anything. Classes are getting disrupted.",
    imageUrl: null,
    adminRemarks: "Replaced projector bulb. Working fine now.",
    assignedTo: "IT Department",
    updatedAt: "2025-01-13T16:00:00"
  },
  {
    id: 4,
    subject: "Flickering Lights in Library",
    category: "Light",
    location: "Central Library, Reading Hall",
    status: "Pending",
    priority: "Low",
    submittedBy: "Sneha Reddy",
    email: "sneha@college.edu",
    submittedAt: "2025-01-12T14:45:00",
    description: "The tube lights in the reading hall keep flickering. It's disturbing during study hours.",
    imageUrl: null,
    adminRemarks: "",
    assignedTo: null,
    updatedAt: "2025-01-12T14:45:00"
  },
  {
    id: 5,
    subject: "Broken Bench in Cafeteria",
    category: "Infrastructure",
    location: "Cafeteria, Ground Floor",
    status: "Rejected",
    priority: "Low",
    submittedBy: "Vikram Singh",
    email: "vikram@college.edu",
    submittedAt: "2025-01-11T12:30:00",
    description: "One of the benches is broken and unsafe to sit on.",
    imageUrl: null,
    adminRemarks: "Duplicate complaint. Already resolved in complaint #47",
    assignedTo: null,
    updatedAt: "2025-01-11T15:00:00"
  },
  {
    id: 6,
    subject: "Water Leakage in Boys Hostel",
    category: "Plumbing",
    location: "Boys Hostel, Block B, Room 305",
    status: "In Progress",
    priority: "High",
    submittedBy: "Arjun Mehta",
    email: "arjun@college.edu",
    submittedAt: "2025-01-10T07:00:00",
    description: "There's continuous water leakage from the bathroom ceiling. The room is getting flooded.",
    imageUrl: null,
    adminRemarks: "Plumber assigned. Work in progress.",
    assignedTo: "Plumbing Team",
    updatedAt: "2025-01-10T10:30:00"
  },
  {
    id: 7,
    subject: "Slow WiFi in Computer Lab",
    category: "Network",
    location: "Computer Lab 1, IT Block",
    status: "Pending",
    priority: "Medium",
    submittedBy: "Neha Gupta",
    email: "neha@college.edu",
    submittedAt: "2025-01-09T16:20:00",
    description: "The internet connection is very slow and keeps disconnecting. Students cannot complete their assignments.",
    imageUrl: null,
    adminRemarks: "",
    assignedTo: null,
    updatedAt: "2025-01-09T16:20:00"
  },
  {
    id: 8,
    subject: "Broken Door Lock in Classroom 405",
    category: "Infrastructure",
    location: "Classroom 405, Main Building, Floor 4",
    status: "Resolved",
    priority: "Medium",
    submittedBy: "Rohan Das",
    email: "rohan@college.edu",
    submittedAt: "2025-01-08T10:00:00",
    description: "The door lock is broken and the classroom cannot be secured properly.",
    imageUrl: null,
    adminRemarks: "Lock replaced. Issue resolved.",
    assignedTo: "Maintenance Team",
    updatedAt: "2025-01-08T18:00:00"
  },
  // Add these complaints to your existing array in adminService.js

{
  id: 9,
  subject: "AC Not Working in Auditorium",
  category: "Fan",
  location: "Main Auditorium",
  status: "Pending",
  priority: "High",
  submittedBy: "Anjali Desai",
  email: "anjali@college.edu",
  submittedAt: "2025-01-22T14:00:00",
  description: "The air conditioning system in the auditorium has stopped working.",
  imageUrl: null,
  adminRemarks: "",
  assignedTo: null,
  updatedAt: "2025-01-22T14:00:00"
},
{
  id: 10,
  subject: "Broken Whiteboard in Room 205",
  category: "Infrastructure",
  location: "Room 205, Science Block",
  status: "In Progress",
  priority: "Low",
  submittedBy: "Karan Malhotra",
  email: "karan@college.edu",
  submittedAt: "2025-01-21T11:15:00",
  description: "The whiteboard markers don't erase properly and the board is damaged.",
  imageUrl: null,
  adminRemarks: "New board ordered",
  assignedTo: "Maintenance",
  updatedAt: "2025-01-21T15:00:00"
},
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all complaints
 */
export const getAllComplaints = () => {
  return [...complaints].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
};

/**
 * Get complaint by ID
 */
export const getComplaintById = (id) => {
  return complaints.find(c => c.id === id);
};

/**
 * Filter complaints based on criteria
 */
export const filterComplaints = ({ status = 'All', search = '', dateRange = 'All' }) => {
  let filtered = [...complaints];

  // Filter by status
  if (status !== 'All') {
    filtered = filtered.filter(c => c.status === status);
  }

  // Filter by search (subject, category, location)
  if (search.trim() !== '') {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.subject.toLowerCase().includes(searchLower) ||
      c.category.toLowerCase().includes(searchLower) ||
      c.location.toLowerCase().includes(searchLower)
    );
  }

  // Filter by date range
  if (dateRange === 'Last 7 Days') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    filtered = filtered.filter(c => new Date(c.submittedAt) >= sevenDaysAgo);
  } else if (dateRange === 'Last 30 Days') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filtered = filtered.filter(c => new Date(c.submittedAt) >= thirtyDaysAgo);
  }

  return filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
};

/**
 * Get statistics
 */
export const getStats = () => {
  return {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
    rejected: complaints.filter(c => c.status === 'Rejected').length
  };
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = (id, newStatus, remarks = '') => {
  const complaint = complaints.find(c => c.id === id);
  if (complaint) {
    complaint.status = newStatus;
    complaint.adminRemarks = remarks;
    complaint.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
};

/**
 * Get complaints grouped by category (for analytics)
 */
export const getComplaintsByCategory = () => {
  const categories = {};
  complaints.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  return Object.entries(categories).map(([name, count]) => ({ name, count }));
};

/**
 * Get complaints grouped by status (for analytics)
 */
export const getComplaintsByStatus = () => {
  const statuses = {};
  complaints.forEach(c => {
    statuses[c.status] = (statuses[c.status] || 0) + 1;
  });
  return Object.entries(statuses).map(([name, value]) => ({ name, value }));
};

export const getComplaintsTrend = () => {
  const last7Days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Count complaints submitted on this date
    const count = complaints.filter(c => {
      const complaintDate = new Date(c.submittedAt);
      return complaintDate.toDateString() === date.toDateString();
    }).length;
    
    last7Days.push({
      date: dateStr,
      complaints: count
    });
  }
  
  return last7Days;
};

/**
 * Get priority distribution
 */
export const getPriorityDistribution = () => {
  const priorities = {};
  complaints.forEach(c => {
    priorities[c.priority] = (priorities[c.priority] || 0) + 1;
  });
  return Object.entries(priorities).map(([name, value]) => ({ name, value }));
};

/**
 * Get average resolution time (mock data)
 */
export const getAverageResolutionTime = () => {
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
  if (resolvedComplaints.length === 0) return 0;
  
  // Mock: Calculate hours between submission and update
  const totalHours = resolvedComplaints.reduce((sum, c) => {
    const submitted = new Date(c.submittedAt);
    const updated = new Date(c.updatedAt);
    const hours = (updated - submitted) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  
  return Math.round(totalHours / resolvedComplaints.length);
};