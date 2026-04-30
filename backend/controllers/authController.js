const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../services/emailService');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Validate role
    if (!['jobSeeker', 'recruiter'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either jobSeeker or recruiter',
      });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      status: role === 'recruiter' ? 'pending' : 'approved',
    });

    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture || '',
        skills: user.skills || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user (stateless)
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email',
      });
    }

    const user = await User.findOne({ email });

    // Always return 200 to avoid email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token and expiry to user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Build reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendResetEmail(user.email, resetToken, resetLink);
    } catch (emailErr) {
      // If email fails, clear the reset token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error('Email error:', emailErr);
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PATCH /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Hash the token to match stored one
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user by reset token and check expiry
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired',
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Generate new token
    const newToken = generateToken(user);

    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
