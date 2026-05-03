const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isBlacklisted } = require('../services/tokenBlacklist');

// verify JWT and attach user to request
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // reject if token was blacklisted on logout
      if (decoded.jti && isBlacklisted(decoded.jti)) {
        return res.status(401).json({
          success: false,
          message: 'Token has been invalidated. Please log in again.',
        });
      }

      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // attach decoded token so logout can read the jti
      req.token = decoded;

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (err) {
    next(err);
  }
};

// check if user has the required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};