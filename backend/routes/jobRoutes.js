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
  getRecommendedJobs,
} = require('../controllers/jobController');

const { getJobApplicants } = require("../controllers/jobApplicantsController");

router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.get('/recommended', protect, authorize('jobSeeker'), getRecommendedJobs);

router.route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter'), createJob);

// must be before /:id to avoid conflict
router.get("/:jobId/applicants", protect, authorize("recruiter"), getJobApplicants);

router.get('/:id', getJobById);
router.patch('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;