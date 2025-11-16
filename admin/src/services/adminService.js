// src/services/adminService.js

// ============================================
// MOCK DATA - 12 Complaints (10 Regular + 2 Anonymous)
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
    adminRemarks: "",
    assignedTo: null,
    updatedAt: "2025-01-15T09:30:00",
    images: [
      'https://media.istockphoto.com/id/1367991732/photo/old-style-electric-ceiling-fan-inside-the-building.jpg?s=612x612&w=0&k=20&c=VyNwwXB-LdO03lAApAn20pWhf_sSEhhpVtvpYVVIIWg=',
      'https://media.istockphoto.com/id/1827663223/photo/old-electric-ceiling-fan.jpg?s=612x612&w=0&k=20&c=_1o7LEeDtlzsILVmMvUi2F4EMrCNIZjSIAYqcyjA0Mo='
    ],
    verificationDocument: {
      filename: "application_rahul_sharma.pdf",
      size: 2458624,
      uploadedAt: "2025-01-15T09:28:00",
      url: "#"
    },
    isAnonymous: false
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
    adminRemarks: "Cleaning staff assigned",
    assignedTo: "Maintenance Team",
    updatedAt: "2025-01-14T14:30:00",
    images: [
      'https://media.istockphoto.com/id/1080548080/photo/dirty-toilet-in-public-building-by-human-walk.jpg?s=612x612&w=0&k=20&c=rBRwaPw7pG2CEAbG1prJPomAtIhwINk-IkN6Quj0V4U='
    ],
    verificationDocument: null,
    isAnonymous: false
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
    adminRemarks: "Replaced projector bulb. Working fine now.",
    assignedTo: "IT Department",
    updatedAt: "2025-01-13T16:00:00",
    images: [
      'https://media.istockphoto.com/id/1218810293/photo/detail-on-the-hamburg-airport-during-covid-19-pandemic.jpg?s=612x612&w=0&k=20&c=i62AMJ9ODUqh2-zyYiMxQy3tL7gl2g-mT2aYgiX2o7s='
    ],
    verificationDocument: {
      filename: "lab_complaint_application.pdf",
      size: 1856432,
      uploadedAt: "2025-01-13T08:10:00",
      url: "#"
    },
    isAnonymous: false
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
    adminRemarks: "",
    assignedTo: null,
    updatedAt: "2025-01-12T14:45:00",
    images: [
      'https://media.istockphoto.com/id/1144415708/photo/light-bulbs-minimal-idea-concept.jpg?s=612x612&w=0&k=20&c=9nj9qflYnGFGKNotxDtLfqe84UK-8nrz_ZZ0utq0138='
    ],
    verificationDocument: null,
    isAnonymous: false
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
    adminRemarks: "Duplicate complaint. Already resolved in complaint #47",
    assignedTo: null,
    updatedAt: "2025-01-11T15:00:00",
    images: [
      'https://media.istockphoto.com/id/1319779994/photo/vandalism-in-a-urban-public-park.jpg?s=612x612&w=0&k=20&c=yiyjNjC_vpDQJOBSq3ELf1wdU5t99EHIlulqT69vleU='
    ],
    verificationDocument: null,
    isAnonymous: false
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
    adminRemarks: "Plumber assigned. Work in progress.",
    assignedTo: "Plumbing Team",
    updatedAt: "2025-01-10T10:30:00",
    images: [
      'https://media.istockphoto.com/id/154926525/photo/leaking-ceiling.jpg?s=612x612&w=0&k=20&c=RkCZreHN4bStjOJHZSWGr1GcQXGZK6miR9GoCUSaF_I='
    ],
    verificationDocument: {
      filename: "hostel_complaint_arjun.pdf",
      size: 3245120,
      uploadedAt: "2025-01-10T06:55:00",
      url: "#"
    },
    isAnonymous: false
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
    adminRemarks: "",
    assignedTo: null,
    updatedAt: "2025-01-09T16:20:00",
    images: [],
    verificationDocument: null,
    isAnonymous: false
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
    adminRemarks: "Lock replaced. Issue resolved.",
    assignedTo: "Maintenance Team",
    updatedAt: "2025-01-08T18:00:00",
    images: [],
    verificationDocument: null,
    isAnonymous: false
  },
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
    adminRemarks: "",
    assignedTo: null,
    updatedAt: "2025-01-22T14:00:00",
    images: [],
    verificationDocument: null,
    isAnonymous: false
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
    adminRemarks: "New board ordered",
    assignedTo: "Maintenance",
    updatedAt: "2025-01-21T15:00:00",
    images: [],
    verificationDocument: null,
    isAnonymous: false
  },
  
  // ============================================
  // NEW ANONYMOUS COMPLAINTS
  // ============================================
  
  {
    id: 11,
    subject: "Inappropriate Behavior by Staff Member",
    category: "Other",
    location: "2nd Floor, Central Library",
    status: "In Progress",
    priority: "High",
    submittedBy: "Anonymous Student",
    email: null,
    submittedAt: "2025-01-20T10:15:00",
    description: "I want to report inappropriate behavior and harassment by a cleaning staff member on the 2nd floor of the library. This person has been making uncomfortable comments to female students. Please investigate this matter urgently as it's affecting our ability to study safely.",
    adminRemarks: "Investigation started. CCTV footage being reviewed. Security has been notified.",
    assignedTo: "Security Head",
    updatedAt: "2025-01-20T16:30:00",
    images: [],
    verificationDocument: {
      filename: "student_id_verification.pdf",
      size: 1245632,
      uploadedAt: "2025-01-20T10:12:00",
      url: "#"
    },
    isAnonymous: true
  },
  
  {
    id: 12,
    subject: "Ragging Incident in Boys Hostel",
    category: "Other",
    location: "Boys Hostel, Block C, Floor 3",
    status: "Pending",
    priority: "High",
    submittedBy: "Anonymous Student",
    email: null,
    submittedAt: "2025-01-23T22:45:00",
    description: "There have been multiple incidents of ragging by senior students in Block C. They are forcing first-year students to do inappropriate tasks late at night. This needs immediate attention as it's creating a hostile environment. I'm submitting this anonymously for safety reasons.",
    adminRemarks: "",
    assignedTo: null,
    updatedAt: "2025-01-23T22:45:00",
    images: [],
    verificationDocument: null,
    isAnonymous: true
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all complaints (sorted by newest first)
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
 * UPDATED: Now handles empty strings for "All" filters
 */
export const filterComplaints = ({ status = '', search = '', dateRange = 'all' }) => {
  console.log('🔍 filterComplaints called with:', { status, search, dateRange });
  
  let filtered = [...complaints];

  // Filter by status (empty string = show all)
  if (status && status !== '' && status !== 'All') {
    console.log('📌 Filtering by status:', status);
    filtered = filtered.filter(c => c.status === status);
  }

  // Filter by search (subject, category, location, description)
  if (search && search.trim() !== '') {
    console.log('🔎 Filtering by search:', search);
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.subject.toLowerCase().includes(searchLower) ||
      c.category.toLowerCase().includes(searchLower) ||
      c.location.toLowerCase().includes(searchLower) ||
      c.description.toLowerCase().includes(searchLower)
    );
  }

  // Filter by date range
  if (dateRange && dateRange !== 'all' && dateRange !== 'All') {
    console.log('📅 Filtering by date:', dateRange);
    
    const now = new Date();
    let dateThreshold = new Date();

    if (dateRange === 'today') {
      dateThreshold.setHours(0, 0, 0, 0);
    } else if (dateRange === 'week' || dateRange === 'Last 7 Days') {
      dateThreshold.setDate(now.getDate() - 7);
    } else if (dateRange === 'month' || dateRange === 'Last 30 Days') {
      dateThreshold.setDate(now.getDate() - 30);
    }

    filtered = filtered.filter(c => new Date(c.submittedAt) >= dateThreshold);
  }

  // Sort by newest first
  const sorted = filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  
  console.log('✅ filterComplaints returning:', sorted.length, 'complaints');
  
  return sorted;
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
    
    // Auto-assign based on status
    if (newStatus === 'In Progress' && !complaint.assignedTo) {
      complaint.assignedTo = 'Maintenance Team';
    }
    
    console.log('✅ Updated complaint #' + id + ' to ' + newStatus);
    return true;
  }
  
  console.error('❌ Complaint #' + id + ' not found');
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

/**
 * Get complaints trend (last 7 days)
 */
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
 * Get priority distribution (for analytics)
 */
export const getPriorityDistribution = () => {
  const priorities = {};
  complaints.forEach(c => {
    priorities[c.priority] = (priorities[c.priority] || 0) + 1;
  });
  return Object.entries(priorities).map(([name, value]) => ({ name, value }));
};

/**
 * Get average resolution time in hours (for analytics)
 */
export const getAverageResolutionTime = () => {
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
  if (resolvedComplaints.length === 0) return 0;
  
  // Calculate hours between submission and update
  const totalHours = resolvedComplaints.reduce((sum, c) => {
    const submitted = new Date(c.submittedAt);
    const updated = new Date(c.updatedAt);
    const hours = (updated - submitted) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);
  
  return Math.round(totalHours / resolvedComplaints.length);
};

/**
 * Get complaints by location (for analytics - optional)
 */
export const getComplaintsByLocation = () => {
  const locations = {};
  complaints.forEach(c => {
    // Extract building from location (e.g., "Room 101, Main Building" -> "Main Building")
    const building = c.location.split(',').pop().trim();
    locations[building] = (locations[building] || 0) + 1;
  });
  return Object.entries(locations).map(([name, count]) => ({ name, count }));
};

/**
 * Get recent activity (last 5 complaints)
 */
export const getRecentActivity = () => {
  return [...complaints]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);
};