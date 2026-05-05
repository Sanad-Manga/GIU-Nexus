const express = require('express');
const router  = express.Router();

const { protect, authorize } = require('../middleware/auth');
const {
  getJobs,
  getMyJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  saveJob,
  getSavedJobs,
} = require('../controllers/jobController');

const { getJobApplicants } = require("../controllers/jobApplicantsController");

router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);

// SCRUM-50: get saved jobs (must be before /:id to avoid conflict)
router.get('/saved', protect, authorize('jobSeeker'), getSavedJobs);

router.route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter'), createJob);

// must be before /:id to avoid conflict
router.get("/:jobId/applicants", protect, authorize("recruiter"), getJobApplicants);

router.get('/:id', getJobById);
router.patch('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

// SCRUM-37: toggle save/unsave a job (job seeker only)
router.post('/:id/save', protect, authorize('jobSeeker'), saveJob);

module.exports = router;