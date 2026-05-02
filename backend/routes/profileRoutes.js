const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { extractSkills } = require('../controllers/profileController');

router.post('/extract-skills', protect, authorize('jobSeeker'), extractSkills);

module.exports = router;
