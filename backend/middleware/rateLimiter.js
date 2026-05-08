const { rateLimit, MemoryStore } = require('express-rate-limit');

const authLimiterStore = new MemoryStore();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: authLimiterStore,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again after 15 minutes',
  },
});

module.exports = { authLimiter, authLimiterStore };
