const express = require("express");
const router = express.Router();

const {
  getMyApplications,
  applyToJob,
  updateApplicationStatus,
} = require("../controllers/applicationController");

const { getJobApplicants } = require("../controllers/jobApplicantsController");
const { protect, authorize } = require("../middleware/auth");

// job seeker routes
router.get("/my", protect, authorize("jobSeeker"), getMyApplications);                 // GET  /applications/my
router.post("/:jobId/apply", protect, authorize("jobSeeker"), applyToJob);             // POST /jobs/:jobId/apply

// recruiter routes
router.patch("/:id/status", protect, authorize("recruiter"), updateApplicationStatus); // PATCH /applications/:id/status

module.exports = router;