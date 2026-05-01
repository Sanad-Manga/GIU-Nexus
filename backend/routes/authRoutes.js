const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
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

// Public routes (rate limited)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// Private routes
router.post('/logout', protect, logout);

module.exports = router;