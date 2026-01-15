
# 🎓 CCMS – Campus Complaint Management System  
**Report it. Track it. Fix it. 🚀**

![Status](https://img.shields.io/badge/Status-Live-success)
![Build](https://img.shields.io/badge/Build-Stable-blue)
![License](https://img.shields.io/badge/License-Academic-orange)
![Made With](https://img.shields.io/badge/Made%20with-React%20%7C%20Node.js%20%7C%20MongoDB-informational)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-purple)

A modern **full-stack web application** for managing campus facility complaints with **real-time tracking, analytics, and automated workflows**.

🟢 **All modules are live, stable, and deployed in production**

---

## 🌐 Live Application

| Service | URL | Status |
|------|-----|------|
| 🏠 Landing Page | https://ccms-home.vercel.app | ✅ Live |
| 👨‍💼 Admin Dashboard | https://ccms-admin-rho.vercel.app | ✅ Live |
| 📚 Student Portal | https://ccms-student.vercel.app | ✅ Live |
| ⚙️ Backend API | https://campus-backend-rq7f.onrender.com | ✅ Live |

👉 **Start Here:** [Landing Page](https://ccms-home.vercel.app)

---

## 👥 Team

| Member | Responsibility | Status |
|------|------|------|
| Harshit | Admin Dashboard & Integration | ✅ Complete |
| Shakti | Landing Page & UI Design | ✅ Complete |
| Somesh | Backend API & Database | ✅ Complete |
| Shiva | Database Design & Testing | ✅ Complete |

---

## 📦 Project Modules

### 🏠 Landing Page  
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-Yes-38bdf8)

**Purpose:** Central entry point for all users.

**Key Features**
- Role-based authentication  
- University-branded UI  
- Fully responsive design  
- Smooth animations  

---

### 🎛️ Admin Dashboard  
![Analytics](https://img.shields.io/badge/Analytics-Enabled-green)
![Dark Mode](https://img.shields.io/badge/Dark%20Mode-Supported-black)

**Purpose:** Complete control panel for complaint monitoring and resolution.

**Key Features**
- Real-time complaint statistics  
- Status updates & management  
- Interactive charts (Recharts)  
- CSV export & printable reports  
- Notification system  

---

### 📱 Student Portal  
![Uploads](https://img.shields.io/badge/File%20Uploads-Images%20%7C%20PDFs-blue)
![Mobile](https://img.shields.io/badge/Mobile-Responsive-success)

**Purpose:** Easy complaint submission & tracking for students.

**Key Features**
- Submit complaints with attachments  
- Track real-time status updates  
- View complaint history  
- Mobile-first experience  

---

### ⚙️ Backend API  
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-blue)

**Purpose:** Secure and scalable backend services.

**Key Features**
- RESTful APIs  
- JWT-based authentication  
- Role-based access control  
- Cloudinary file storage  
- Analytics & reporting endpoints  

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/HarshitPandey-2021/Campus-Complaint-Management-System
cd Campus-Complaint-Management-System
````

### Backend

```bash
cd backend
npm install
npm run dev
```

### Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

### Student Portal

```bash
cd user-portal
npm install
npm run dev
```

### Landing Page

```bash
cd frontend/student-ui
npm install
npm run dev
```

---

## 🔧 Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS |
| Backend    | Node.js, Express.js, JWT     |
| Database   | MongoDB Atlas                |
| Storage    | Cloudinary                   |
| Deployment | Vercel, Render               |

---

## 📝 Environment Variables

### Frontend

```env
VITE_API_URL=https://campus-backend-rq7f.onrender.com/api
VITE_ADMIN_APP_URL=https://ccms-admin-rho.vercel.app
VITE_USER_APP_URL=https://ccms-student.vercel.app
```

### Backend

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🌳 Git Workflow

* **main** → Production (protected 🔒)
* **develop** → Integration & testing
* **feature/*** → Feature development

**Commit Convention**

* `feat:` Feature
* `fix:` Bug
* `docs:` Documentation
* `style:` UI updates

---

## 🔌 API Endpoints

```http
POST   /api/auth/login
POST   /api/auth/register
GET    /api/complaints
POST   /api/complaints
GET    /api/complaints/:id
PUT    /api/admin/complaints/:id/status
GET    /api/complaints/admin/analytics
```

---

## 🎯 Features Delivered

* ✅ Role-based authentication
* ✅ Real-time complaint tracking
* ✅ Admin analytics dashboard
* ✅ File uploads (Images & PDFs)
* ✅ Dark / Light mode
* ✅ CSV export & printable reports
* ✅ Mobile-responsive UI
* ✅ Production deployment

---

## 📞 Support & Ownership

* **Admin Dashboard:** Harshit
* **Landing Page:** Shakti
* **Backend API:** Somesh
* **Database:** Shiva

---

## 📝 License

**Academic Project**
University of Lucknow | 2025

Built with ❤️ by **Team CCMS**

*Last Updated: January 2026*
*Default Branch: `develop`*


