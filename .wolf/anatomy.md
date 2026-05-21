# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-12T17:35:47.162Z
> Files: 210 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.dockerignore` — Docker ignore rules (~17 tok)
- `.gitignore` — Git ignore rules (~50 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `docker-compose.yml` — Docker Compose services (~363 tok)
- `Dockerfile` — Docker container definition (~55 tok)
- `GIU_Nexus_MS1.code-workspace` (~46 tok)
- `GIU-Nexus.postman_collection.json` — Declares r (~11646 tok)
- `GIU-Nexus.postman_environment.json` (~355 tok)
- `jest.config.js` — Jest test configuration (~46 tok)
- `package-lock.json` — npm lock file (~76508 tok)
- `package.json` — Node.js package manifest (~409 tok)
- `POSTMAN_GUIDE.md` — GIU Nexus - Postman Collection Guide (~1666 tok)
- `railway.toml` (~21 tok)
- `README.md` — Project documentation (~1745 tok)

## .claude/

- `settings.json` (~441 tok)
- `settings.local.json` (~32 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## .github/workflows/

- `ci.yml` — CI: CI/CD (~248 tok)

## backend/

- `app.js` — API routes: GET (1 endpoints) (~395 tok)
- `seed.js` — Declares mongoose (~581 tok)
- `server.js` — Declares dns (~235 tok)

## backend/__tests__/

- `fixtures.js` — Declares USERS (~179 tok)
- `integration.test.js` — Mock external services before anything else is imported (~3194 tok)

## backend/config/

- `cloudinary.js` — Declares cloudinary (~71 tok)
- `db.js` — Declares mongoose (~228 tok)
- `swagger.js` — Declares swaggerJsdoc (~882 tok)

## backend/controllers/

- `adminController.js` — Declares Application (~564 tok)
- `applicationController.js` — Declares Application (~1196 tok)
- `authController.js` — Declares User (~2500 tok)
- `jobController.js` — Declares JobPost (~2408 tok)
- `profileController.js` — Declares User (~1138 tok)
- `userController.js` — Declares User (~678 tok)

## backend/middleware/

- `.gitkeep` (~0 tok)
- `auth.js` — Declares jwt (~404 tok)
- `ErrorHandler.js` — Declares errorHandler (~261 tok)
- `rateLimiter.js` — Declares authLimiterStore (~142 tok)
- `tokenBlacklist.js` — In-memory blacklist — resets on server restart (~32 tok)
- `upload.js` — Declares multer (~222 tok)

## backend/models/

- `Application.js` — Declares mongoose (~253 tok)
- `JobPost.js` — Declares mongoose (~356 tok)
- `User.js` — mongoose: arrayLimit (~542 tok)

## backend/routes/

- `adminRoutes.js` — API routes: GET (1 endpoints) (~836 tok)
- `applicationRoutes.js` — API routes: GET, POST, PATCH (4 endpoints) (~1543 tok)
- `authRoutes.js` — API routes: POST, PATCH (6 endpoints) (~2296 tok)
- `jobRoutes.js` — API routes: GET, POST, PATCH (7 endpoints) (~3977 tok)
- `profileRoutes.js` — API routes: PATCH, POST (2 endpoints) (~1600 tok)
- `userRoutes.js` — API routes: GET, PATCH, DELETE (4 endpoints) (~1550 tok)

## backend/services/

- `classificationService.js` — hf: classifyJobCategory (~170 tok)
- `emailService.js` — Declares nodemailer (~583 tok)
- `hfService.js` — Declares hf (~37 tok)
- `uploadService.js` — Declares cloudinary (~180 tok)

## client/

- `.gitignore` — Git ignore rules (~76 tok)
- `eslint.config.js` — ESLint flat configuration (~169 tok)
- `index.html` — client (~99 tok)
- `package-lock.json` — npm lock file (~28138 tok)
- `package.json` — Node.js package manifest (~198 tok)
- `README.md` — Project documentation (~261 tok)
- `vite.config.js` — Vite build configuration (~48 tok)

## client/src/

- `App.css` — Styles: 8 rules, 6 media queries (~879 tok)
- `App.jsx` — App (~1070 tok)
- `index.css` — Styles: 3 rules, 23 vars, 4 media queries (~652 tok)
- `main.jsx` (~125 tok)

## client/src/components/

- `ApplicationStatusBadge.jsx` — colors (~66 tok)
- `Footer.jsx` — Footer (~41 tok)
- `JobCard.jsx` — JobCard (~147 tok)
- `Modal.jsx` — Modal (~104 tok)
- `Navbar.jsx` — Navbar (~390 tok)
- `PrivateRoute.jsx` — PrivateRoute (~84 tok)
- `RoleRoute.jsx` — RoleRoute (~110 tok)
- `SaveJobButton.jsx` — SaveJobButton — uses useState (~148 tok)
- `SkillChip.jsx` — SkillChip (~33 tok)
- `Spinner.jsx` — Spinner (~26 tok)

## client/src/context/

- `AuthContext.jsx` — AuthContext — uses useState, useContext (~274 tok)

## client/src/pages/

- `.gitkeep` (~0 tok)
- `AdminDashboard.jsx` — AdminDashboard (~26 tok)
- `AdminJobsPage.jsx` — AdminJobsPage (~25 tok)
- `AdminUsersPage.jsx` — AdminUsersPage (~26 tok)
- `ApplicantsPage.jsx` — ApplicantsPage (~26 tok)
- `ChangePasswordPage.jsx` — ChangePasswordPage (~29 tok)
- `CreateJobPage.jsx` — CreateJobPage (~25 tok)
- `EditJobPage.jsx` — EditJobPage (~23 tok)
- `EditProfilePage.jsx` — EditProfilePage (~26 tok)
- `ForgotPasswordPage.jsx` — ForgotPasswordPage (~29 tok)
- `HomePage.jsx` — HomePage (~20 tok)
- `JobDetailPage.jsx` — JobDetailPage (~25 tok)
- `JobListPage.jsx` — JobListPage (~23 tok)
- `LoginPage.jsx` — LoginPage (~21 tok)
- `MyApplicationsPage.jsx` — MyApplicationsPage (~29 tok)
- `PendingRecruitersPage.jsx` — PendingRecruitersPage (~32 tok)
- `ProfilePage.jsx` — ProfilePage (~23 tok)
- `RecommendedJobsPage.jsx` — RecommendedJobsPage (~30 tok)
- `RecruiterDashboard.jsx` — RecruiterDashboard (~29 tok)
- `RegisterPage.jsx` — RegisterPage (~24 tok)
- `ResetPasswordPage.jsx` — ResetPasswordPage (~28 tok)
- `SavedJobsPage.jsx` — SavedJobsPage (~25 tok)

## client/src/services/

- `api.js` — Declares api (~179 tok)

## client/src/utils/

- `.gitkeep` (~0 tok)
- `categoryColors.js` — Exports CATEGORY_COLORS (~50 tok)

## postman/collections/GIU Nexus — Full API/.resources/

- `definition.yaml` (~6 tok)

## postman/collections/GIU Nexus — Full API/1. Auth/

- `1.1 Register (jobSeeker).request.yaml` — Declares r (~156 tok)
- `1.2 Register (recruiter).request.yaml` — Declares r (~140 tok)
- `1.3 Login (jobSeeker).request.yaml` — Declares r (~139 tok)
- `1.4 Login (recruiter).request.yaml` — Declares r (~144 tok)
- `1.5 Login (admin).request.yaml` — Declares r (~121 tok)
- `1.6 Logout.request.yaml` (~36 tok)
- `1.7 Forgot Password (sends OTP).request.yaml` (~62 tok)
- `1.8 Verify OTP.request.yaml` — Declares r (~126 tok)
- `1.9 Reset Password.request.yaml` (~68 tok)

## postman/collections/GIU Nexus — Full API/1. Auth/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full API/2. Profile/

- `2.1 Get Profile.request.yaml` (~35 tok)
- `2.2 Update Profile (set bio for AI).request.yaml` (~85 tok)
- `2.3 Change Password.request.yaml` (~87 tok)
- `2.4 Extract Skills (AI — NER).request.yaml` (~40 tok)

## postman/collections/GIU Nexus — Full API/2. Profile/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full API/3. Admin/

- `3.1 Get All Users.request.yaml` (~60 tok)
- `3.2 Get User by ID.request.yaml` (~41 tok)
- `3.3 Approve Recruiter.request.yaml` (~76 tok)
- `3.4 Get Admin Stats.request.yaml` (~38 tok)
- `3.5 Get All Applications (admin).request.yaml` (~55 tok)
- `3.6 Delete User.request.yaml` (~40 tok)

## postman/collections/GIU Nexus — Full API/3. Admin/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full API/4. Jobs/

- `4.1 Get All Jobs (public).request.yaml` (~46 tok)
- `4.10 Delete Job.request.yaml` (~41 tok)
- `4.2 Create Job (AI classification).request.yaml` — Declares r (~214 tok)
- `4.3 Create Job (DevOps — verify AI).request.yaml` (~148 tok)
- `4.4 Get Job by ID.request.yaml` (~24 tok)
- `4.5 Update Job.request.yaml` (~71 tok)
- `4.6 Get My Jobs (recruiter).request.yaml` (~39 tok)
- `4.7 Get Recommended Jobs (AI — embeddings).request.yaml` (~38 tok)
- `4.8 Save Job.request.yaml` (~39 tok)
- `4.9 Get Saved Jobs.request.yaml` (~36 tok)

## postman/collections/GIU Nexus — Full API/4. Jobs/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full API/5. Applications/

- `5.1 Apply to Job.request.yaml` — Declares r (~152 tok)
- `5.2 Apply Again (expect 400).request.yaml` (~74 tok)
- `5.3 Get My Applications.request.yaml` (~37 tok)
- `5.4 Get Job Applicants (recruiter).request.yaml` (~43 tok)
- `5.5 Shortlist Application.request.yaml` (~78 tok)

## postman/collections/GIU Nexus — Full API/5. Applications/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full Collection/.resources/

- `definition.yaml` (~46 tok)

## postman/collections/GIU Nexus — Full Collection/1. Auth/

- `1.1 Register — Job Seeker.request.yaml` — Declares r (~190 tok)
- `1.10 [Edge] Register — Missing Fields (expect 400).request.yaml` (~77 tok)
- `1.11 [Edge] Login — Wrong Password (expect 401).request.yaml` (~84 tok)
- `1.12 [Edge] No Token on Protected Route (expect 401).request.yaml` (~44 tok)
- `1.2 Register — Recruiter.request.yaml` — Declares r (~202 tok)
- `1.3 Login — Job Seeker.request.yaml` — Declares r (~151 tok)
- `1.4 Login — Recruiter.request.yaml` — Declares r (~160 tok)
- `1.5 Login — Admin.request.yaml` — Declares r (~154 tok)
- `1.6 Forgot Password — Send OTP.request.yaml` (~98 tok)
- `1.7 Verify OTP.request.yaml` — Declares r (~148 tok)
- `1.8 Reset Password.request.yaml` — Declares r (~149 tok)
- `1.9 Logout.request.yaml` (~64 tok)

## postman/collections/GIU Nexus — Full Collection/1. Auth/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full Collection/2. Profile/

- `2.1 Get My Profile.request.yaml` (~40 tok)
- `2.2 Update Profile — Add Tech Bio.request.yaml` (~162 tok)
- `2.3 Change Password.request.yaml` (~112 tok)
- `2.4 Extract Skills — AI NER [HF- dslim-bert-base-NER].request.yaml` (~176 tok)
- `2.5 [Edge] Extract Skills — Recruiter (expect 403).request.yaml` (~64 tok)

## postman/collections/GIU Nexus — Full Collection/2. Profile/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full Collection/3. Users (Admin)/

- `3.1 Get All Users.request.yaml` (~58 tok)
- `3.2 Get Pending Recruiters.request.yaml` (~82 tok)
- `3.3 Get User by ID.request.yaml` (~45 tok)
- `3.4 Approve Recruiter ⚡ (run before section 4).request.yaml` (~112 tok)
- `3.5 Reject User.request.yaml` (~82 tok)
- `3.6 Restore User to Pending.request.yaml` (~82 tok)
- `3.7 Delete User.request.yaml` (~64 tok)
- `3.8 [Edge] Get Users as Job Seeker (expect 403).request.yaml` (~52 tok)
- `3.9 [Edge] Get User by Invalid ID (expect 404).request.yaml` (~67 tok)

## postman/collections/GIU Nexus — Full Collection/3. Users (Admin)/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full Collection/4. Jobs/

- `4.1 Get All Jobs — Public.request.yaml` (~42 tok)
- `4.10 Get My Jobs (Recruiter).request.yaml` (~45 tok)
- `4.11 Get Job by ID (public).request.yaml` (~44 tok)
- `4.12 Update Job — New Description [AI re-classifies].request.yaml` (~192 tok)
- `4.13 Apply to Job via -jobs ⚡.request.yaml` — Declares r (~224 tok)
- `4.14 Get Job Applicants (Recruiter).request.yaml` (~77 tok)
- `4.15 Close Job (status=closed).request.yaml` (~99 tok)
- `4.16 Save Job — Toggle.request.yaml` (~76 tok)
- `4.17 Get Saved Jobs.request.yaml` (~41 tok)
- `4.18 Get Recommended Jobs [AI- sentence-transformers embeddings.request.yaml` (~186 tok)
- `4.19 Delete Job.request.yaml` (~72 tok)
- `4.2 Get All Jobs — Filter by Keyword.request.yaml` (~54 tok)
- `4.20 [Edge] Create Job — Pending Recruiter (expect 403).request.yaml` (~156 tok)
- `4.21 [Edge] Apply Twice — Duplicate (expect 400).request.yaml` (~106 tok)
- `4.22 [Edge] Save Closed Job (expect 400).request.yaml` (~68 tok)
- `4.23 [Edge] Get Job by Invalid ID (expect 404).request.yaml` (~53 tok)
- `4.24 [Edge] Edit Another Recruiter's Job (expect 403).request.yaml` (~108 tok)
- `4.3 Get All Jobs — Filter by Type=internship.request.yaml` (~42 tok)
- `4.4 Get All Jobs — Filter by Status=open + Location.request.yaml` (~50 tok)
- `4.5 Create Job — Backend [AI- zero-shot → 'Backend'] ⚡.request.yaml` — Declares r (~386 tok)
- `4.6 Create Job — AI-ML [AI- zero-shot → 'AI-ML'].request.yaml` (~246 tok)
- `4.7 Create Job — Frontend [AI- zero-shot → 'Frontend'].request.yaml` (~242 tok)
- `4.8 Create Job — DevOps [AI- zero-shot → 'DevOps'].request.yaml` (~233 tok)
- `4.9 Create Job — Data Engineering [AI- zero-shot → 'Data Eng.request.yaml` (~236 tok)

## postman/collections/GIU Nexus — Full Collection/4. Jobs/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full Collection/5. Applications/

- `5.1 Get All Applications (Admin).request.yaml` (~86 tok)
- `5.2 Get My Applications (Job Seeker).request.yaml` (~42 tok)
- `5.3 Apply to Job via -applications (alternate route).request.yaml` — Declares r (~219 tok)
- `5.4 Update App Status — Shortlist.request.yaml` (~112 tok)
- `5.5 Update App Status — Reject.request.yaml` (~85 tok)
- `5.6 Update App Status — Reset to Pending.request.yaml` (~85 tok)
- `5.7 [Edge] Apply Again — Duplicate (expect 400).request.yaml` (~110 tok)
- `5.8 [Edge] Update Status as Job Seeker (expect 403).request.yaml` (~104 tok)
- `5.9 [Edge] Get All Applications as Recruiter (expect 403).request.yaml` (~61 tok)

## postman/collections/GIU Nexus — Full Collection/5. Applications/.resources/

- `definition.yaml` (~10 tok)

## postman/collections/GIU Nexus — Full Collection/6. Admin/

- `6.1 Get Platform Stats.request.yaml` (~73 tok)
- `6.2 [Edge] Get Stats as Job Seeker (expect 403).request.yaml` (~54 tok)

## postman/collections/GIU Nexus — Full Collection/6. Admin/.resources/

- `definition.yaml` (~10 tok)

## postman/environments/

- `GIU Nexus — Railway.environment.yaml` (~141 tok)
- `New Environment.environment.yaml` (~62 tok)

## postman/globals/

- `workspace.globals.yaml` (~8 tok)

## server/

- `seed.js` — Declares mongoose (~583 tok)
