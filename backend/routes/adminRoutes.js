const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminApplications, getAdminStats } = require('../controllers/adminController');

router.get('/applications', protect, authorize('admin'), getAdminApplications);
router.get('/stats', protect, authorize('admin'), getAdminStats);

module.exports = router;
