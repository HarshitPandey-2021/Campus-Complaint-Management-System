# Backend (Simple Guide)

This backend handles:
- user login and registration
- complaints (create, update, status)
- admin actions (view, assign, analytics)
- file uploads (images, PDFs)

If you are new, read in this order.

## 1) Start point
- `index.js` starts the server and connects the database.
- `src/app.js` sets up Express and connects routes.

## 2) Routes (what URL does what)
Routes only define URLs and call controllers. They are simple.
- `src/routes/auth.js` login, register, refresh, change password
- `src/routes/profile.js` profile view, update, stats
- `src/routes/complaints.js` complaints for students and admins
- `src/routes/adminComplaints.js` admin-only complaint actions
- `src/routes/files.js` PDF file access
- `src/routes/health.js` health check and cloudinary test

## 3) Controllers (real logic)
Controllers do the work: validation, database queries, response.
- `src/controllers/authController.js` auth logic
- `src/controllers/profileController.js` profile logic
- `src/controllers/complaintsController.js` complaint logic
- `src/controllers/filesController.js` file logic
- `src/controllers/healthController.js` health checks
- `src/controllers/adminLogsController.js` admin logs

## 4) Middleware (helpers used by routes)
- `src/middlewares/auth.js` checks JWT token and role
- `src/middlewares/upload.js` handles file uploads

## 5) Config (external services)
- `src/config/db.js` connects MongoDB and creates indexes
- `src/config/cloudinary.js` connects Cloudinary

## 6) Utils (small helpers)
- `src/utils/toObjectId.js` convert string to Mongo ObjectId
- `src/utils/normalizeRole.js` normalize role text
- `src/utils/cloudinaryUpload.js` upload file buffer to Cloudinary
