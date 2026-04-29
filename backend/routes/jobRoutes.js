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
} = require('../controllers/jobController');

router.get('/my-jobs', protect, authorize('recruiter'), getMyJobs);

router.route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter'), createJob);

router.get('/:id', getJobById);
router.patch('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

module.exports = router;