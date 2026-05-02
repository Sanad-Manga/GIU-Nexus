const Application = require("../models/Application");
const JobPost = require("../models/JobPost");

// GET /applications/my — returns all applications for the logged-in job seeker
// populates job title, company, type, status — newest first
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate("job", "title company type status")
      .sort({ appliedAt: -1 });

    return res.status(200).json({ applications });
  } catch (err) {
    console.error("getMyApplications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /jobs/:jobId/apply — creates a new application for the logged-in job seeker
// guards: job must exist + be open + user hasn't applied before
// duplicate apply returns 400 (fallback check + Ahmed's compound index as backup)
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ message: "This job is no longer accepting applications" });
    }

    const existing = await Application.findOne({ user: req.user._id, job: jobId });
    if (existing) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }

    const application = await Application.create({
      user: req.user._id,
      job: jobId,
      coverLetter: coverLetter || "",
      status: "pending",
    });

    return res.status(201).json({ message: "Application submitted", application });
  } catch (err) {
    // 11000 = MongoDB duplicate key, fired by Ahmed's compound index { user, job }
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already applied to this job" });
    }
    console.error("applyToJob error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /applications/:id/status — recruiter updates application status
// status must be: pending | shortlisted | rejected
// only the recruiter who owns the job post can update its applications (403 otherwise)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = ["pending", "shortlisted", "rejected"];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const application = await Application.findById(id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorised to update this application" });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({ message: "Status updated", application });
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getMyApplications,
  applyToJob,
  updateApplicationStatus,
};