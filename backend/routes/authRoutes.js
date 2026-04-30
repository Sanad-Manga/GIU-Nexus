const express = require('express');
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

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Private routes
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.patch('/profile/change-password', protect, changePassword);

module.exports = router;
