````markdown
# 🎓 CCMS - Campus Complaint Management System

## 👋 Project Goal

Welcome to the **Campus Complaint Management System (CCMS)**!  

This platform allows students to report campus issues (broken lights, dirty bathrooms, etc.) and enables admins to track, assign, and resolve them efficiently.

### 🌟 Key Tech Stack
- **Frontend:** React.js (Student UI)
- **Admin Panel:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas

---

## 👥 Team Roles

| Member | Focus Area |
| :--- | :--- |
| **Somesh** | Backend/API (Node.js, MongoDB, Auth) |
| **Shakti** | Frontend/Student UI (React forms, dashboards) |
| **Harshit** | Admin Panel (React tables, assignment logic) |
| **Shiva** | Databse/ Testing (Bugs, Deployment, Server setup) |

---

## 🌳 Git Workflow

We only use **two main branches**:

1. **`main`** → Production-ready code. **DO NOT commit here directly.**
2. **`develop`** → Integration/testing branch where all features are merged.

### Daily Routine

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create a feature branch
git checkout -b yourname-feature
# Example: git checkout -b john-auth

# 3. Work on your feature

# 4. Stage, commit, and push
git add .
git commit -m "Add: feature description"
git push origin yourname-feature

# 5. Open a Pull Request (PR) to merge into develop
# Ask a teammate to review before merging
````

---

## 🚀 Local Setup Instructions

We have three apps, so open **three terminal windows**.

### 1️⃣ Clone Repository

```bash
git clone [https://github.com/HarshitPandey-2021/Campus-Complaint-Management-System]
cd ccms-project
git checkout develop
```

### 2️⃣ Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Admin Panel
cd ../admin
npm install
```

### 3️⃣ Setup `.env` (Backend)

Create `backend/.env` by copying keys from `.env.example`:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

> ⚠️ Never commit `.env` to GitHub!

### 4️⃣ Run Everything

**Terminal 1 (Backend):**

```bash
cd backend
npm run dev  # Runs on http://localhost:5000
```

**Terminal 2 (Frontend/Student UI):**

```bash
cd frontend
npm start    # Runs on http://localhost:3000
```

**Terminal 3 (Admin Panel):**

```bash
cd admin
npm start    # Runs on http://localhost:3001
```

---

## 📁 Project Structure (Minimal)

```
ccms-project/
├── frontend/     # Student UI (React)
│   ├── src/
│   └── package.json
├── admin/        # Admin Panel (React)
│   ├── src/
│   └── package.json
├── backend/      # Node/Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── routes/
│   └── package.json
├── docs/         # Project documentation
│   ├── project-overview.md
│   ├── api-docs.md
│   └── meeting-notes.md
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛑 Important Rules

| Rule                                      | Why?                                     |
| ----------------------------------------- | ---------------------------------------- |
| ❌ Never commit directly to `main`         | That branch is only for stable code      |
| ✅ Always work on your own branch          | Keeps work isolated and avoids conflicts |
| ✅ Pull from `develop` first               | Prevents merge conflicts                 |
| ✅ Use Pull Requests to merge into develop | Ensures code review before integration   |
| ❌ Don’t commit `.env` or `node_modules`   | Security and repo size issues            |

---

## 📚 Documentation (`docs/` folder)

* `project-overview.md` → Project description and goals
* `api-docs.md` → API endpoints and request/response examples
* `meeting-notes.md` → Notes from team discussions

> Keep your docs updated as you develop features!

---

## ⚡ Quick Start Checklist

1. `git checkout develop`
2. `git pull origin develop`
3. `git checkout -b yourname-feature`
4. Install dependencies: `npm install` in each folder
5. Create `.env` in backend
6. Run backend and both frontends
7. Test locally before committing

---

**Let’s build something awesome! 🚀**

```

