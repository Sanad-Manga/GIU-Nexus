const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, extractSkills } = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.patch('/', protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.post('/extract-skills', protect, authorize('jobSeeker'), extractSkills);

module.exports = router;