# **PART 2: COMPLETE BACKEND INTEGRATION GUIDE** 🔌

---

## **📦 EVERYTHING BACKEND TEAM NEEDS TO BUILD**

Save this as: `admin/docs/BACKEND_REQUIREMENTS.md`

```markdown
# Backend API Requirements for Admin Panel

## 🔐 Authentication Endpoints

### 1. Admin Login
**POST** `/api/admin/login`

**Request Body:**
```json
{
  "email": "admin@uolucknow.ac.in",
  "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "admin_001",
      "name": "Notwhite444",
      "email": "admin@uolucknow.ac.in",
      "role": "System Administrator",
      "department": "Administration",
      "university": "University of Lucknow",
      "phone": "+91 9876543210",
      "joinedDate": "2024-01-15T00:00:00Z"
    }
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 2. Get Admin Profile
**GET** `/api/admin/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "admin_001",
    "name": "Notwhite444",
    "email": "admin@uolucknow.ac.in",
    "role": "System Administrator",
    "department": "Administration",
    "university": "University of Lucknow",
    "phone": "+91 9876543210",
    "joinedDate": "2024-01-15T00:00:00Z",
    "profilePicture": "https://example.com/avatar.jpg" // Optional
  }
}
```

---

### 3. Update Admin Profile
**PATCH** `/api/admin/profile`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Notwhite444",
  "phone": "+91 9876543210",
  "department": "Administration"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated user object
  }
}
```

---

### 4. Change Password
**PATCH** `/api/admin/change-password`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 5. Logout
**POST** `/api/admin/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📋 Complaint Endpoints

### 6. Get All Complaints
**GET** `/api/complaints`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (All Optional):**
```
?status=Pending
&category=Fan
&search=broken
&dateFrom=2025-01-01
&dateTo=2025-01-31
&sortBy=submittedAt
&sortOrder=desc
&page=1
&limit=50
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": 1,
        "subject": "Broken Ceiling Fan in Room 101",
        "category": "Fan",
        "location": "Room 101, Main Building, Floor 2",
        "status": "Pending",
        "priority": "High",
        "submittedBy": "Rahul Sharma",
        "submittedByEmail": "rahul@college.edu",
        "submittedByRole": "Student",
        "submittedByPhone": "+91 9876543210",
        "submittedAt": "2025-01-15T09:30:00Z",
        "description": "The ceiling fan is not working properly and makes strange noises when turned on. It needs immediate repair as the room gets very hot.",
        "images": [
          "https://yourdomain.com/uploads/complaint-1-img1.jpg",
          "https://yourdomain.com/uploads/complaint-1-img2.jpg"
        ],
        "adminRemarks": "",
        "assignedTo": null,
        "updatedAt": "2025-01-15T09:30:00Z",
        "anonymous": false
      }
      // ... more complaints
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalComplaints": 245,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### 7. Get Single Complaint
**GET** `/api/complaints/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "subject": "Broken Ceiling Fan in Room 101",
    "category": "Fan",
    "location": "Room 101, Main Building, Floor 2",
    "status": "Pending",
    "priority": "High",
    "submittedBy": "Rahul Sharma",
    "submittedByEmail": "rahul@college.edu",
    "submittedByRole": "Student",
    "submittedByPhone": "+91 9876543210",
    "submittedAt": "2025-01-15T09:30:00Z",
    "description": "Detailed description...",
    "images": ["url1.jpg", "url2.jpg"],
    "adminRemarks": "",
    "assignedTo": null,
    "updatedAt": "2025-01-15T09:30:00Z",
    "anonymous": false,
    "history": [
      {
        "status": "Pending",
        "changedBy": "System",
        "changedAt": "2025-01-15T09:30:00Z",
        "remarks": "Complaint submitted"
      }
    ]
  }
}
```

---

### 8. Update Complaint Status
**PATCH** `/api/complaints/:id/status`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "In Progress",
  "adminRemarks": "Electrician assigned. Will fix by tomorrow.",
  "assignedTo": "Electrical Department" // Optional
}
```

**Valid Statuses:**
- `"Pending"`
- `"In Progress"`
- `"Resolved"`
- `"Rejected"`

**Response (200):**
```json
{
  "success": true,
  "message": "Complaint status updated successfully",
  "data": {
    // Updated complaint object
    "id": 1,
    "status": "In Progress",
    "adminRemarks": "Electrician assigned. Will fix by tomorrow.",
    "assignedTo": "Electrical Department",
    "updatedAt": "2025-01-15T14:30:00Z"
  }
}
```

**IMPORTANT:** 
- When status changes to **"Resolved"**, send email to student automatically
- Email should include: Subject, Status, Admin Remarks, Resolution Date

---

### 9. Get Dashboard Stats
**GET** `/api/complaints/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 245,
    "pending": 78,
    "inProgress": 45,
    "resolved": 105,
    "rejected": 17
  }
}
```

---

### 10. Get Analytics Data
**GET** `/api/complaints/analytics`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (Optional):**
```
?dateFrom=2025-01-01
&dateTo=2025-01-31
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categoryData": [
      { "name": "Fan", "count": 45 },
      { "name": "Light", "count": 38 },
      { "name": "Cleanliness", "count": 52 },
      { "name": "Projector", "count": 28 },
      { "name": "Infrastructure", "count": 35 },
      { "name": "Plumbing", "count": 25 },
      { "name": "Network", "count": 22 }
    ],
    "statusData": [
      { "name": "Pending", "value": 78 },
      { "name": "In Progress", "value": 45 },
      { "name": "Resolved", "value": 105 },
      { "name": "Rejected", "value": 17 }
    ],
    "trendData": [
      { "date": "Jan 9", "complaints": 12 },
      { "date": "Jan 10", "complaints": 15 },
      { "date": "Jan 11", "complaints": 8 },
      { "date": "Jan 12", "complaints": 18 },
      { "date": "Jan 13", "complaints": 22 },
      { "date": "Jan 14", "complaints": 16 },
      { "date": "Jan 15", "complaints": 20 }
    ]
  }
}
```

---

## 📊 Database Schema Requirements

### **Users Table (Student/Faculty/Admin)**
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Student', 'Faculty', 'Admin') NOT NULL,
  department VARCHAR(100),
  university VARCHAR(100),
  phone VARCHAR(20),
  profile_picture TEXT,
  joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### **Complaints Table**
```sql
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  category ENUM('Fan', 'Light', 'Cleanliness', 'Projector', 'Infrastructure', 'Plumbing', 'Network') NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('Pending', 'In Progress', 'Resolved', 'Rejected') DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  submitted_by VARCHAR(50) NOT NULL,  -- Foreign key to users.id
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_remarks TEXT,
  assigned_to VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  anonymous BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (submitted_by) REFERENCES users(id)
);
```

### **Complaint Images Table**
```sql
CREATE TABLE complaint_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
```

### **Complaint History Table** (For Timeline)
```sql
CREATE TABLE complaint_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  status ENUM('Pending', 'In Progress', 'Resolved', 'Rejected') NOT NULL,
  changed_by VARCHAR(50) NOT NULL,  -- Admin ID or "System"
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
```

---

## 📧 Email Notification Requirements

### **When Complaint is Resolved:**

**Trigger:** Status changed to `"Resolved"` via API endpoint 8

**Email Template:**

```
To: {student_email}
Subject: Your Complaint Has Been Resolved - CCMS

Dear {student_name},

Your complaint has been successfully resolved!

Complaint Details:
- ID: #{complaint_id}
- Subject: {subject}
- Category: {category}
- Location: {location}
- Submitted: {submitted_date}

Resolution Details:
- Status: Resolved
- Resolved On: {resolved_date}
- Admin Remarks: {admin_remarks}

Thank you for using the Campus Complaint Management System.

Best regards,
University of Lucknow
CCMS Team
```

**Technology Suggestions:**
- Nodemailer (Node.js)
- SendGrid API
- AWS SES
- SMTP server

---

## 🔒 Security Requirements

1. **JWT Token:**
   - Expiry: 24 hours
   - Refresh token: 7 days (optional)
   - Store in httpOnly cookie (recommended) OR localStorage

2. **Password:**
   - Hash with bcrypt (salt rounds: 10+)
   - Min length: 8 characters
   - Must contain: 1 uppercase, 1 lowercase, 1 number

3. **File Upload:**
   - Max file size: 5MB per image
   - Max images: 3 per complaint
   - Allowed formats: JPG, PNG, WEBP
   - Store in: AWS S3 / Cloudinary / Local storage
   - Return public URL in API response

4. **CORS:**
   - Allow origin: `https://notwhite.netlify.app` (production)
   - Allow origin: `http://localhost:5173` (development)

5. **Rate Limiting:**
   - Login: 5 attempts per 15 minutes
   - API: 100 requests per minute per user

---

## 🔗 API Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://your-backend.com/api`

**Set in Frontend:**
```javascript
// admin/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

**Create `.env` file:**
```
VITE_API_URL=http://localhost:5000/api
```

**Create `.env.production` file:**
```
VITE_API_URL=https://your-backend.com/api
```

---

## 📝 Error Response Format

**All errors should follow this format:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Specific field error" // Optional
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not enough permissions)
- `404` - Not Found
- `500` - Server Error

---

## ✅ Testing Checklist for Backend Team

Use Postman/Thunder Client to test:

```
Authentication:
□ POST /api/admin/login (valid credentials) → 200 + token
□ POST /api/admin/login (invalid credentials) → 401
□ GET /api/admin/profile (with token) → 200
□ GET /api/admin/profile (without token) → 401
□ PATCH /api/admin/profile → 200
□ PATCH /api/admin/change-password → 200

Complaints:
□ GET /api/complaints → 200 + array of complaints
□ GET /api/complaints?status=Pending → filtered results
□ GET /api/complaints?search=fan → search results
□ GET /api/complaints/:id → 200 + single complaint
□ GET /api/complaints/999 → 404
□ PATCH /api/complaints/1/status (Pending → In Progress) → 200
□ PATCH /api/complaints/1/status (In Progress → Resolved) → 200 + email sent
□ GET /api/complaints/stats → 200 + {total, pending, etc}
□ GET /api/complaints/analytics → 200 + chart data

Edge Cases:
□ Update already resolved complaint → 400 or 403
□ Update complaint without adminRemarks (when Resolved) → 400
□ Upload image > 5MB → 400
□ Upload 4 images (max is 3) → 400
□ SQL injection attempts → Prevented
□ XSS attempts → Sanitized
```

---

## 📦 Sample Postman Collection

Save this as `CCMS_Admin_API.postman_collection.json`:

```json
{
  "info": {
    "name": "CCMS Admin API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [{"key": "token", "value": "{{authToken}}"}]
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/admin/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"admin@uolucknow.ac.in\",\"password\":\"test123\"}"
        }
      }
    },
    {
      "name": "Get All Complaints",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/complaints"
      }
    },
    {
      "name": "Update Complaint Status",
      "request": {
        "method": "PATCH",
        "url": "{{baseUrl}}/complaints/1/status",
        "body": {
          "mode": "raw",
          "raw": "{\"status\":\"In Progress\",\"adminRemarks\":\"Working on it\"}"
        }
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:5000/api"}
  ]
}
```

---

END OF BACKEND REQUIREMENTS
```

---

# **PART 3: FRONTEND INTEGRATION CODE**

Create this file: `admin/src/services/api.js`

```javascript
// admin/src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Common headers
const getHeaders = (isFormData = false) => {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Handle API errors
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// ==========================================
// AUTHENTICATION API
// ==========================================

export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    
    const data = await handleResponse(response);
    
    // Save token
    if (data.success && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/logout`, {
      method: 'POST',
      headers: getHeaders()
    });
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUser');
    
    return handleResponse(response);
  }
};

// ==========================================
// COMPLAINTS API
// ==========================================

export const complaintsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${API_BASE_URL}/complaints?${queryString}`
      : `${API_BASE_URL}/complaints`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  updateStatus: async (id, status, adminRemarks, assignedTo = null) => {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminRemarks, assignedTo })
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/complaints/stats`, {
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  getAnalytics: async (dateFrom = null, dateTo = null) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    
    const queryString = params.toString();
    const url = queryString
      ? `${API_BASE_URL}/complaints/analytics?${queryString}`
      : `${API_BASE_URL}/complaints/analytics`;
    
    const response = await fetch(url, {
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

// ==========================================
// EXAMPLE USAGE IN COMPONENTS
// ==========================================

/*
// In Dashboard.jsx:
import { complaintsAPI } from '../services/api';

useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await complaintsAPI.getStats();
      setStats(response.data); // {total, pending, inProgress, resolved, rejected}
    } catch (error) {
      console.error('Failed to fetch stats:', error.message);
    }
  };
  
  fetchStats();
}, []);

// In Complaints.jsx:
const handleStatusUpdate = async (id, newStatus, remarks) => {
  try {
    setLoading(true);
    const response = await complaintsAPI.updateStatus(id, newStatus, remarks);
    
    if (response.success) {
      showToast('✅ Status updated successfully!', 'success');
      // Refresh complaints list
      fetchComplaints();
    }
  } catch (error) {
    showToast('❌ ' + error.message, 'error');
  }