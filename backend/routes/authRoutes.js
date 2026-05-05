const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

const upload = require('../middleware/upload');

// Public routes (rate limited)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Private routes
router.post('/logout', protect, logout);
router.patch('/profile/change-password', protect, changePassword);
// PATCH /api/v1/auth/profile - now accepts multipart/form-data with optional file
router.route('/profile')
  .get(protect, getProfile)
  .patch(protect, upload.single('profilePicture'), updateProfile);

// change-password remains JSON-only
router.route('/profile/change-password')
  .patch(protect, changePassword);

module.exports = router;