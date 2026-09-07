const { rateLimit } = require('express-rate-limit');
const MongoRateLimitStore = require('./mongoRateLimitStore');

const authLimiterStore = new MongoRateLimitStore({ prefix: 'auth:' });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX || '10'),
  store: authLimiterStore,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again after 15 minutes',
  },
});

module.exports = { authLimiter, authLimiterStore };
