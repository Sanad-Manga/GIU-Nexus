# GIU Nexus - Postman Collection Guide

This folder contains Postman collection and environment files for testing the GIU Nexus authentication and recruiter approval workflows.

## Files

- **GIU-Nexus-Auth-Collection.postman_collection.json** — Complete collection with all auth endpoints and workflows
- **GIU-Nexus-Local-Dev.postman_environment.json** — Environment file with variables (BASE_URL, TOKEN, etc.)

## Setup Instructions

### 1. Import Collection & Environment into Postman

1. Open Postman
2. Click **Import** (top-left)
3. Select **GIU-Nexus-Auth-Collection.postman_collection.json**
4. Click **Import** button
5. Repeat for **GIU-Nexus-Local-Dev.postman_environment.json**

### 2. Select the Environment

In Postman's top-right corner, find the environment dropdown (next to the eye icon). Select **GIU Nexus - Local Dev**.

### 3. Start Your Server

```bash
npm run dev
```

The API should be running on `http://localhost:5000/api/v1`

---

## Test Scenarios Covered

### Flow 1: Job Seeker Auth

**What it tests:** Complete authentication flow for job seekers

1. **1.1 Register Job Seeker** — Create a new job seeker account
2. **1.2 Login Job Seeker** — Login and automatically capture JWT token
3. **1.3 Get Own Profile (Protected)** — Use the token on a protected route

**Expected Results:**
- ✅ Register returns 201 with user and token
- ✅ Login returns 200 with token auto-saved to `{{TOKEN}}`
- ✅ Protected route returns 200 with user profile

---

### Flow 2: Recruiter Approval & Job Creation

**What it tests:** Full recruiter lifecycle from pending to posting jobs

1. **2.1 Register Recruiter** — Create a recruiter account (status: pending)
2. **2.2 Verify Recruiter Status** — Login as recruiter, confirm status is "pending"
3. **2.3 Admin Login** — Login as admin (must be created in DB first)
4. **2.4 Get Pending Recruiters** — List all pending recruiters (copy recruiter's _id)
5. **2.5 Approve Recruiter** — Update recruiter status to "approved" (paste _id into {{RECRUITER_ID}})
6. **2.6 Recruiter Login After Approval** — Login again, verify status is now "approved"
7. **2.7 Recruiter Creates Job** — Post a job (only works after approval)

**Expected Results:**
- ✅ Recruiter registers with status: "pending"
- ✅ Admin can fetch pending recruiters
- ✅ Admin approval changes status to "approved"
- ✅ Recruiter can create jobs only after approval (403 if pending)
- ✅ Job creation returns 201 with auto-assigned category

---

### Flow 3: Password Reset

**What it tests:** Forgot password + reset flow

1. **3.1 Forgot Password** — Request password reset email
2. **3.2 Reset Password** — Use token from email to set new password

**Expected Results:**
- ✅ Forgot password returns 200 (doesn't reveal if email exists)
- ✅ Reset password with valid token returns 200 and new JWT
- ✅ Reset password with invalid/expired token returns 400

---

## Key Features

### Auto-Token Capture

After logging in (requests 1.2, 2.3, 2.6), the token is automatically saved to environment variables via Postman's Tests tab:

```javascript
const res = pm.response.json();
if (res.token) {
  pm.environment.set('TOKEN', res.token);
}
```

**You don't need to manually copy-paste tokens.**

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `BASE_URL` | API base URL (http://localhost:5000/api/v1) |
| `TOKEN` | Job seeker JWT (auto-set after 1.2) |
| `ADMIN_TOKEN` | Admin JWT (auto-set after 2.3) |
| `RECRUITER_TOKEN` | Recruiter JWT (auto-set after 2.6) |
| `RECRUITER_ID` | Recruiter's MongoDB _id (manually copy from 2.4 response) |
| `RESET_TOKEN` | Password reset token (from email link) |

---

## Pre-requisites

### Before running these tests:

1. **Database Setup**
   - Ensure MongoDB is running
   - Update `.env` with correct `MONGO_URI`

2. **Admin Account**
   - Admins can be created through a protected registration secret or directly in MongoDB.
   - Set `ADMIN_REGISTRATION_SECRET` in `.env` before using admin registration.
   - Example in MongoDB Compass:
     ```json
     {
       "name": "Admin",
       "email": "admin@example.com",
       "password": "<bcrypt-hashed-password>",
       "role": "admin",
       "status": "approved"
     }
     ```
   - Or seed via a script

3. **Email Service (for password reset)**
   - Update `.env` with Gmail credentials or test SMTP
   - May need app-specific password if using Gmail

---

## Workflow Walkthrough

### First Time Run

1. **Go to 1.1 Register Job Seeker** → Click Send
2. **Go to 1.2 Login Job Seeker** → Click Send (token auto-captured)
3. **Go to 1.3 Get Own Profile** → Click Send (uses auto-captured token)

✅ **Result:** You see the profile in the response

---

### Recruiter Approval Flow

1. **Go to 2.1 Register Recruiter** → Click Send (creates pending recruiter)
2. **Go to 2.3 Admin Login** → Click Send (must have admin in DB first)
3. **Go to 2.4 Get Pending Recruiters** → Click Send
4. Copy the `_id` from the response
5. **Go to 2.5 Approve Recruiter** → In the URL, replace `{{RECRUITER_ID}}` with the copied _id
6. **Go to 2.6 Recruiter Login After Approval** → Click Send
7. **Go to 2.7 Recruiter Creates Job** → Click Send

✅ **Result:** Job is created with auto-assigned AI category

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check that the token variable is set (check environment at top-right). Re-run the login request. |
| 400 Email already in use | Use a different email for each test run (add timestamp: `sara-{{$timestamp}}@example.com`) |
| 403 Pending Approval | Make sure you ran the approval flow (2.1-2.5) before trying 2.7 |
| Token not auto-captured | Make sure the request has the Tests tab with the script. Check response is valid JSON with `token` field. |
| 500 Server Error | Check server logs. Verify `.env` is set correctly and MongoDB is running. |

---

## Screenshots for PR

For each request, you can:
1. Click **Send**
2. Wait for response
3. Click **Screenshot** (in top-right of response pane)
4. Attach to your PR description

This provides proof that all flows work end-to-end.

---

## Next Steps

Once auth is working:
- Other team members import this collection
- They add their own routes (jobs, applications, etc.)
- Everyone uses the same `TOKEN` variable format
- Merge this collection to `main` so it's documented for graders

---

**Last Updated:** April 29, 2026  
**Collection Version:** 1.0  
**API Version:** v1
