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

---

## Production

- Set `NODE_ENV=production`.
- Use strong, unique values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
## Production (Render)

### Required environment variables

| Variable | Example / notes |
|----------|-----------------|
| `BREVO_API_KEY` | `xkeysib-...` from Brevo → API keys |
| `MAIL_FROM` | Verified sender in Brevo (Senders & IP) — **not** the SMTP login |
| `MAIL_FROM_NAME` | `CCMS Team` |
| `SMTP_USER` | Brevo SMTP login e.g. `a440c1001@smtp-brevo.com` |
| `SMTP_PASS` | Brevo **SMTP key** (fallback if API IP blocked) |
| `SMTP_HOST` | `smtp-relay.brevo.com` (default if omitted) |
| `NODE_ENV` | `production` |

### Brevo IP blocking (common Render issue)

If **Security → Authorized IPs → block unauthorized IPs** is ON for API keys, Render will fail with 401/403.

**Permanent fix:** disable IP restriction for API keys, **or** set `SMTP_USER` + `SMTP_PASS` so the backend auto-falls back to Brevo SMTP when the API is blocked.

### Verify after deploy

Open: `https://your-render-url.onrender.com/health/email`

- `"ok": true` → email is configured
- `"ok": false` → check `"issues"` array and fix Render env vars

Without email config, `/auth/forgot-password/request` returns **503**.
- Copy `.env.example` to `.env` and fill in all required variables.
