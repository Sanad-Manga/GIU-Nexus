const Application = require("../models/Application");
const JobPost = require("../models/JobPost");

// GET /jobs/:jobId/applicants — returns all applicants for a specific job post
// only the recruiter who created that job can access this (403 otherwise)
// populates applicant's name, email, bio, skills, profilePicture — newest first
const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorised to view these applicants" });
    }

    const applicants = await Application.find({ job: jobId })
      .populate("user", "name email bio skills profilePicture")
      .sort({ appliedAt: -1 });

    return res.status(200).json({ jobId, totalApplicants: applicants.length, applicants });
  } catch (err) {
    console.error("getJobApplicants error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getJobApplicants };